// public/scripts.js

const socket = io();
const params = new URLSearchParams(window.location.search);
const isDJ = params.get("dj") === "true";
const roomDiv = document.getElementById("room");
const lobbyDiv = document.getElementById("lobby");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const buzzButton = document.getElementById("buzzButton");
const status = document.getElementById("status");
const roomNameDisplay = document.getElementById("roomName");
const resetButton = document.getElementById("resetButton");
const resetContainer = document.getElementById("resetContainer");
const buzzList = document.getElementById("buzzList");
const participantsDiv = document.getElementById("participants");

function capitalizeRoomName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function enableBuzzButton() {
  if (buzzButton) {
    buzzButton.disabled = false;
    buzzButton.classList.remove("buzzed");
    buzzButton.onclick = () => {
      socket.emit("buzz");
      buzzButton.disabled = true;
      buzzButton.classList.add("buzzed");
    };
  }
}

function showConfetti() {
  const confetti = document.createElement("div");
  confetti.classList.add("confetti");
  confetti.innerHTML = "<span style='font-size:3em;'>🎉</span>";
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}

if (isDJ) {
  lobbyDiv.classList.add("hidden");
  roomDiv.classList.remove("hidden");
  resetContainer.classList.remove("hidden");

  fetch("/generate-room-name")
    .then((res) => res.json())
    .then((data) => {
      const roomName = capitalizeRoomName(data.roomName);
      roomNameDisplay.textContent = roomName;
      socket.emit("joinRoom", { room: roomName, isDJ: true });
      enableBuzzButton();
    });

  resetButton.addEventListener("click", () => {
    socket.emit("resetBuzz");
  });
} else {
  const roomParam = params.get("room");

  if (roomParam) {
    const formattedRoom = capitalizeRoomName(roomParam);
    fetch(`/check-room?name=${formattedRoom}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exists) {
          const pseudo = prompt("Quel est ton prénom ?");
          if (!pseudo) return;
          lobbyDiv.classList.add("hidden");
          roomDiv.classList.remove("hidden");
          roomNameDisplay.textContent = formattedRoom;
          socket.emit("joinRoom", { room: formattedRoom, name: pseudo });
          enableBuzzButton();
        } else {
          alert("Cette salle n'existe pas !");
        }
      });
  } else {
    joinBtn.addEventListener("click", () => {
      const input = roomInput.value.trim();
      const formattedRoom = capitalizeRoomName(input);
      if (!formattedRoom) return;

      fetch(`/check-room?name=${formattedRoom}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            const pseudo = prompt("Quel est ton prénom ?");
            if (!pseudo) return;
            lobbyDiv.classList.add("hidden");
            roomDiv.classList.remove("hidden");
            roomNameDisplay.textContent = formattedRoom;
            socket.emit("joinRoom", { room: formattedRoom, name: pseudo });
            enableBuzzButton();
          } else {
            alert("Cette salle n'existe pas !");
          }
        });
    });
  }
}

socket.on("buzz", (buzzers) => {
  buzzList.innerHTML = "";
  if (!buzzers || buzzers.length === 0) {
    status.textContent = "En attente du buzz...";
    if (buzzButton) {
      buzzButton.classList.remove("buzzed");
      buzzButton.disabled = false;
    }
    return;
  }

  status.textContent = `${buzzers[0].name} a buzzé en premier ! 🎉`;

  const list = document.createElement("ul");
  buzzers.forEach((b, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${b.name}`;
    list.appendChild(li);
  });
  buzzList.appendChild(list);

  const myName = roomNameDisplay.textContent;
  const firstName = buzzers[0].name;
  if (firstName === socket.data?.name) {
    showConfetti();
  }
});

socket.on("updateParticipants", (names) => {
  if (isDJ && participantsDiv) {
    participantsDiv.innerHTML = "<strong>Participants :</strong><br>" + names.join(", ");
  }
});
