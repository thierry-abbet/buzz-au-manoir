// public/scripts.js

const socket = io();
const params = new URLSearchParams(window.location.search);
let roomName = params.get("name");
const isDj = params.get("dj") === "true";

const displayRoom = document.getElementById("room-name");
const status = document.getElementById("status");
const buzzButton = document.getElementById("buzz");

// 🔠 Normalisation du nom de salle
if (roomName) {
  roomName = roomName.charAt(0).toUpperCase() + roomName.slice(1).toLowerCase();
}

// 🧾 Affichage du nom de la salle
if (roomName && displayRoom) {
  displayRoom.innerText = `Salle : ${roomName}`;
}

// 🔔 Buzz
if (buzzButton) {
  buzzButton.addEventListener("click", () => {
    socket.emit("buzz");
  });
}

// 👥 Connexion
if (!isDj) {
  if (!roomName) {
    alert("Nom de salle manquant !");
    window.location.href = "/";
  } else {
    // ⚠️ Vérification si la salle existe avant de demander le pseudo
    socket.emit("joinRoom", { room: roomName, name: null, isDj: false });
  }
} else {
  socket.emit("joinRoom", { room: roomName, name: "DJ", isDj: true });
}

// 📢 Réception buzz
socket.on("buzz", (name) => {
  status.innerText = `${name} a buzzé en premier ! 🎉`;
});

// ❌ Salle introuvable
socket.on("roomNotFound", () => {
  alert("Salle introuvable.");
  window.location.href = "/";
});

// ✅ Salle OK, demande le nom après vérification
socket.on("roomOk", () => {
  const userName = prompt("Entrez votre prénom :");
  socket.emit("joinRoom", { room: roomName, name: userName, isDj: false });
});
