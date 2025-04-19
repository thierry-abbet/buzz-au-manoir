// public/scripts.js

const socket = io();
const params = new URLSearchParams(window.location.search);
const roomName = params.get("name");
const isDj = params.get("dj") === "true";

const displayRoom = document.getElementById("room-name");
const status = document.getElementById("status");
const buzzButton = document.getElementById("buzz");

if (roomName && displayRoom) {
  displayRoom.innerText = `Salle : ${roomName}`;
}

if (buzzButton) {
  buzzButton.addEventListener("click", () => {
    socket.emit("buzz");
  });
}

if (!isDj) {
  const userName = prompt("Entrez votre prénom :");
  socket.emit("joinRoom", { room: roomName, name: userName, isDj: false });
} else {
  socket.emit("joinRoom", { room: roomName, name: "DJ", isDj: true });
}

socket.on("buzz", (name) => {
  status.innerText = `${name} a buzzé en premier ! 🎉`;
});

socket.on("roomNotFound", () => {
  alert("Salle introuvable.");
  window.location.href = "/";
});
