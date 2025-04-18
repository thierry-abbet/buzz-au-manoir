let socket;
let codePartie = '';
let pseudo = '';

const buzzer = document.getElementById('buzzer');
const status = document.getElementById('status');
const joinForm = document.getElementById('join-form');
const mainUI = document.getElementById('main-ui');
const codeDisplay = document.getElementById('code-display');

joinForm.addEventListener('submit', async e => {
  e.preventDefault();
  codePartie = document.getElementById('code').value.trim().toUpperCase();
  pseudo = document.getElementById('pseudo').value.trim();
  if (!codePartie || !pseudo) return alert('Remplis tous les champs');

  socket = io();

  socket.on('connect', () => {
    socket.emit('join', { code: codePartie, pseudo });
  });

  socket.on('buzzed', data => {
    status.textContent = `Le plus rapide : ${data.name}`;
    buzzer.classList.add('buzzed');
    showConfetti();
  });

  socket.on('reset', () => {
    status.textContent = 'En attente du buzz...';
    buzzer.disabled = false;
    buzzer.classList.remove('buzzed');
  });

  socket.on('error_message', msg => {
    alert(msg);
  });

  joinForm.style.display = 'none';
  mainUI.style.display = 'block';
  codeDisplay.textContent = `Code de la partie : ${codePartie}`;
});

buzzer.addEventListener('click', () => {
  socket.emit('buzz');
  buzzer.disabled = true;
  status.textContent = 'Buzz envoyé !';
});

function showConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
