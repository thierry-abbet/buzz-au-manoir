// public/scripts.js

const socket = io();

// ===============
// UTILITAIRES
// ===============

function formatRoomName(input) {
  if (!input) return "";
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

// ===============
// PAGE LOBBY
// ===============

const createBtn = document.getElementById("create-room");
const joinBtn = document.getElementById("join-room");
const roomInput = document.getElementById("room-name");

if (createBtn && joinBtn && roomInput) {
  roomInput.addEventListener("input", () => {
    roomInput.value = formatRoomName(roomInput.value);
  });

  createBtn.addEventListener("click", () => {
    window.location.href = "/room?dj=true";
  });

  joinBtn.addEventListener("click", () => {
    const room = formatRoomName(roomInput.value.trim());
    if (!room) return alert("Veuillez entrer un nom de salle.");

    // Vérifier si la salle existe avant de demander le pseudo
    socket.emit("check-room", room, (exists) => {
      if (!exists) {
        alert("Cette salle n'existe pas.");
        return;
      }

      const pseudo = prompt("Entrez votre pseudo :");
      if (!pseudo) return;

      window.location.href = `/room?room=${room}&pseudo=${encodeURIComponent(pseudo)}`;
    });
  });
}

// ===============
// PAGE ROOM
// ===============

const buzzerBtn = document.getElementById("buzzer");
const buzzMessage = document.getElementById("buzz-message");

const params = new URLSearchParams(window.location.search);
const isDj = params.get("dj") === "true";
const room = formatRoomName(params.get("room"));
const pseudo = params.get("pseudo") || "Anonyme";

if (room) {
  socket.emit("join-room", { room, pseudo, isDj });
}

if (buzzerBtn) {
  buzzerBtn.addEventListener("click", () => {
    socket.emit("buzz", room);
  });
}

socket.on("buzz", (name) => {
  if (buzzMessage) {
    buzzMessage.textContent = `${name} a buzzé en premier ! 🎉`;
  }
});
