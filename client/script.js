let socket;
let playerName = '';
let gameCode = '';

// Pages
const pageStart = document.getElementById('page-start');
const pageGame = document.getElementById('page-game');

// Formulaire
const createForm = document.getElementById('create-form');
const joinForm = document.getElementById('join-form');

// Champs
const createName = document.getElementById('create-name');
const joinName = document.getElementById('join-name');
const joinCode = document.getElementById('join-code');

// Bouton buzzer
const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');

// Cacher la page de jeu au début
pageGame.style.display = 'none';

// Création de partie
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  playerName = createName.value.trim();
  if (!playerName) return;
  socket = io();
  socket.emit('create-game', playerName);
  setupSocket();
});

// Rejoindre une partie
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  playerName = joinName.value.trim();
  gameCode = joinCode.value.trim().toLowerCase();
  if (!playerName || !gameCode) return;
  socket = io();
  socket.emit('join-game', { gameCode, playerName });
  setupSocket();
});

function setupSocket() {
  socket.on('game-created', (code) => {
    gameCode = code;
    status.textContent = `Partie créée : ${gameCode}`;
    switchToGamePage();
  });

  socket.on('game-joined', () => {
    status.textContent = `Connecté à la partie ${gameCode}`;
    switchToGamePage();
  });

  socket.on('buzzed', data => {
    status.textContent = `Le plus rapide : ${data.name}`;
    buzzer.classList.add('buzzed');
    showConfetti();
  });

  socket.on('reset', () => {
    buzzer.disabled = false;
    buzzer.classList.remove('buzzed');
    status.textContent = 'En attente du buzz...';
  });

  socket.on('error-message', msg => {
    alert(msg);
  });
}

function switchToGamePage() {
  pageStart.style.display = 'none';
  pageGame.style.display = 'block';
}

// Buzzer
buzzer.addEventListener('click', () => {
  socket.emit('buzz', { gameCode, name: playerName });
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

// Confettis
function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
