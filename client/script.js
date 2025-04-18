const socket = io();

// Récupération des éléments HTML
const createBtn = document.getElementById('createRoom');
const createdRoomCode = document.getElementById('createdRoomCode');
const joinBtn = document.getElementById('joinRoom');
const roomInput = document.getElementById('roomCode');
const nameInput = document.getElementById('playerName');
const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');
const gameSection = document.getElementById('game-section');

// Nom de la room et pseudo
let roomName = '';
let playerName = '';

// Générateur de noms marrants
function generateFunnyName() {
  const adjectives = ['Sombre', 'Velu', 'Mystique', 'Flamboyant', 'Moisi', 'Étrange'];
  const nouns = ['Sanglier', 'Gobelin', 'Nain', 'Poney', 'Chaudron', 'Grimoire'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 1000)}`;
}

// Création de la room
createBtn.addEventListener('click', () => {
  roomName = generateFunnyName();
  playerName = 'DJ';
  socket.emit('createRoom', roomName);
  createdRoomCode.textContent = `Code de la partie : ${roomName}`;
  gameSection.style.display = 'block';
});

// Rejoindre une partie
joinBtn.addEventListener('click', () => {
  roomName = roomInput.value.trim();
  playerName = nameInput.value.trim();
  if (roomName && playerName) {
    socket.emit('joinRoom', { room: roomName, name: playerName });
    gameSection.style.display = 'block';
  }
});

// Gestion du bouton buzzer
buzzer.addEventListener('click', () => {
  socket.emit('buzz', { room: roomName, name: playerName });
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

// Affichage du plus rapide
socket.on('buzzed', data => {
  status.textContent = `Le plus rapide : ${data.name}`;
  buzzer.classList.add('buzzed');
  showConfetti();
});

// Fonction d’effet confettis
function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
