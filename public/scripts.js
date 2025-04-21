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

function capitalizeRoomName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

if (isDJ) {
  // DJ crée une salle
  lobbyDiv.classList.add("hidden");
  roomDiv.classList.remove("hidden");

  fetch("/generate-room-name")
    .then((res) => res.json())
    .then((data) => {
      const roomName = capitalizeRoomName(data.roomName);
      roomNameDisplay.textContent = roomName;
      socket.emit("joinRoom", { room: roomName, isDJ: true });
    });
} else {
  // Joueur clique sur "Rejoindre une partie"
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
          socket.emit("joinRoom", { room: formattedRoom, pseudo });
        } else {
          alert("Cette salle n'existe pas !");
        }
      });
  });
}

buzzButton.addEventListener("click", () => {
  socket.emit("buzz");
});

socket.on("buzz", (data) => {
  status.textContent = `${data.name} a buzzé en premier ! 🎉`;
});
