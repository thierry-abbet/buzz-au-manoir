const socket = io();

const loginDiv = document.getElementById("login");
const gameDiv = document.getElementById("game");

const pseudoInput = document.getElementById("pseudo");
const roomInput = document.getElementById("room");
const joinBtn = document.getElementById("join");

const buzzerBtn = document.getElementById("buzzer");
const statusText = document.getElementById("status");
const playerInfo = document.getElementById("player-info");

let pseudo = "";
let room = "";

// Lorsqu'on clique sur "Rejoindre"
joinBtn.addEventListener("click", () => {
  pseudo = pseudoInput.value.trim();
  room = roomInput.value.trim();

  if (!pseudo || !room) {
    alert("Merci de saisir un pseudo et un code de partie.");
    return;
  }

  socket.emit("joinRoom", { pseudo, room });
});

// Réception de la confirmation du serveur
socket.on("joined", ({ pseudo, room }) => {
  loginDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");

  playerInfo.textContent = `Joueur : ${pseudo} | Partie : ${room}`;
  buzzerBtn.disabled = false;
  statusText.textContent = "En attente du buzz...";
});

// Bouton buzzer
buzzerBtn.addEventListener("click", () => {
  socket.emit("buzz", { pseudo, room });
  buzzerBtn.disabled = true;
  statusText.textContent = "Buzz envoyé !";
});

// Quand un joueur buzz
socket.on("buzzed", data => {
  statusText.textContent = `Le plus rapide : ${data.pseudo}`;
  buzzerBtn.classList.add("buzzed");
  showConfetti();
});

function showConfetti() {
  const confetti = document.createElement("div");
  confetti.classList.add("confetti");
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
