const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

if (!roomId) {
  document.body.innerHTML = '<p>Aucune partie spécifiée. Veuillez utiliser un lien valide avec un ID de partie.</p>';
  throw new Error('Aucune room spécifiée.');
}

const socket = io();

let playerName = '';

socket.on('connect', () => {
  console.log('Connecté avec ID :', socket.id);

  // Demande le pseudo si non stocké
  playerName = localStorage.getItem('buzz-player-name') || prompt("Entrez votre pseudo :");
  localStorage.setItem('buzz-player-name', playerName);

  // Rejoindre la partie
  socket.emit('join-room', { roomId, playerName });
});

const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');

buzzer.addEventListener('click', () => {
  socket.emit('buzz', roomId);
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

socket.on('buzzed', (winnerName) => {
  status.textContent = `Le plus rapide : ${winnerName}`;
  buzzer.classList.add('buzzed');
  showConfetti();
});

socket.on('reset', () => {
  buzzer.disabled = false;
  status.textContent = 'En attente du buzz...';
  buzzer.classList.remove('buzzed');
});

function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
