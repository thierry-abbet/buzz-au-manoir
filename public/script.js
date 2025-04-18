const socket = io();

// Cherche les paramètres dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const isDJ = urlParams.get('dj') === 'true';
const roomCodeDisplay = document.getElementById('room-code');

let roomCode = null;

if (isDJ) {
  socket.emit('createRoom');

  socket.on('roomCreated', (code) => {
    roomCode = code;
    if (roomCodeDisplay) {
      roomCodeDisplay.textContent = `Nom de la salle : ${roomCode}`;
    }
  });
} else {
  // Pour les clients qui rejoignent
  const pseudo = prompt("Entrez votre pseudo :");
  const code = prompt("Entrez le nom de la salle :");
  roomCode = code;
  socket.emit('joinRoom', { code, pseudo });

  if (roomCodeDisplay) {
    roomCodeDisplay.textContent = `Salle rejointe : ${roomCode}`;
  }
}

// Buzzer
const buzzer = document.getElementById('buzzer');
if (buzzer) {
  buzzer.addEventListener('click', () => {
    if (roomCode) {
      socket.emit('buzz', { code: roomCode, pseudo: "Anonyme" });
    }
  });
}

// Réception du buzz
socket.on('buzzed', ({ pseudo }) => {
  const buzzDisplay = document.getElementById('buzz-result');
  if (buzzDisplay) {
    buzzDisplay.textContent = `${pseudo} a buzzé en premier ! 🎉`;
  }
});

// Réinitialisation
socket.on('reset', () => {
  const buzzDisplay = document.getElementById('buzz-result');
  if (buzzDisplay) {
    buzzDisplay.textContent = 'En attente du buzz...';
  }
});
