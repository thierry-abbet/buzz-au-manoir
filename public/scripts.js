// public/script.js
const socket = io();

const params = new URLSearchParams(window.location.search);
const isDJ = params.get("dj") === "true";
const roomName = params.get("room");

const buzzBtn = document.getElementById("buzzBtn");
const status = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const roomInfo = document.getElementById("roomInfo");

if (isDJ) {
  socket.emit("create-room");
  socket.on("room-created", (name) => {
    roomInfo.innerText = `Nom de la salle : ${name}`;
    resetBtn.style.display = "inline-block";
    buzzBtn.disabled = true;
  });
} else if (roomName) {
  const pseudo = prompt("Entrez votre pseudo");
  socket.emit("join-room", { roomName, pseudo });
  roomInfo.innerText = `Salle : ${roomName}`;
}

buzzBtn.addEventListener("click", () => {
  socket.emit("buzz", { roomName, pseudo: null });
});

resetBtn.addEventListener("click", () => {
  socket.emit("reset", roomInfo.innerText.split(" ")[3]);
});

socket.on("buzzed", (pseudo) => {
  status.innerText = `${pseudo} a buzzé !`;
  buzzBtn.disabled = true;
});

socket.on("reset-buzz", () => {
  status.innerText = "En attente du buzz...";
  buzzBtn.disabled = false;
});

socket.on("room-error", (msg) => {
  alert(msg);
  window.location.href = "/";
});

socket.on("room-closed", () => {
  alert("La partie a été fermée.");
  window.location.href = "/";
});
