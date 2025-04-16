const socket = io();
const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');

buzzer.addEventListener('click', () => {
  socket.emit('buzz');
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

socket.on('buzzed', data => {
  status.textContent = `Le plus rapide : ${data.name}`;
  buzzer.classList.add('buzzed');
  showConfetti();
});

function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}

const socket = io();

document.getElementById('buzzer').addEventListener('click', () => {
  socket.emit('buzz');
  document.getElementById('status').textContent = 'Buzz envoyé...';
});

// Écoute les buzz venant du serveur
socket.on('buzzed', id => {
  document.getElementById('status').textContent = `Joueur ${id} a buzzé !`;
});
