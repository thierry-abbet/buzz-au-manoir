const socket = io();

const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');
const roomNameElem = document.getElementById('room-name');
const playerNameElem = document.getElementById('player-name');

// Récupération des paramètres de l'URL
const params = new URLSearchParams(window.location.search);
const room = params.get('room');
const pseudo = params.get('pseudo') || 'Anonyme';
const isDJ = params.get('dj') === 'true';

// Affichage des infos
roomNameElem.textContent = `Salle : ${room}`;
if (!isDJ) {
  playerNameElem.textContent = `Joueur : ${pseudo}`;
} else {
  playerNameElem.textContent = `🎧 DJ connecté`;
}

// Envoyer les infos au serveur
socket.emit('joinRoom', { room, pseudo, isDJ });

// Quand on buzz
buzzer.addEventListener('click', () => {
  socket.emit('buzz', { room, pseudo });
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

// Réception du buzz
socket.on('buzzed', data => {
  status.textContent = `${data.pseudo} a buzzé en premier ! 🎉`;
  buzzer.classList.add('buzzed');
  showConfetti();
});

// Confettis
function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
