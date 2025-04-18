const socket = io();
const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');
const info = document.getElementById('info');

// Extraire les paramètres de l’URL
const params = new URLSearchParams(window.location.search);
const isDJ = params.get('dj') === 'true';
let room = params.get('room');
let playerName = localStorage.getItem('playerName');

if (!room && isDJ) {
  // DJ crée une room
  fetch('/generate-room')
    .then(res => res.json())
    .then(data => {
      room = data.room;
      info.innerHTML = `<strong>Nom de la partie :</strong> ${room}`;
      socket.emit('join', { room, name: 'DJ' });
    });
} else if (room) {
  // Client rejoint une room
  if (!playerName) {
    playerName = prompt('Entrez votre pseudo :') || `Joueur_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('playerName', playerName);
  }
  info.innerHTML = `<strong>Partie :</strong> ${room}`;
  socket.emit('join', { room, name: playerName });
}

// Buzz
buzzer.addEventListener('click', () => {
  socket.emit('buzz', { room, name: isDJ ? 'DJ' : playerName });
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

// Réception du buzz
socket.on('buzzed', data => {
  status.textContent = `Le plus rapide : ${data.name}`;
  buzzer.classList.add('buzzed');
  showConfetti();
});

// Réinitialisation (par DJ)
socket.on('reset', () => {
  buzzer.disabled = false;
  buzzer.classList.remove('buzzed');
  status.textContent = 'En attente du buzz...';
});

function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  confetti.style.left = `${Math.random() * 100}%`;
  confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
