let socket;
let currentRoom = '';
let username = '';

document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('create-room');
  const joinBtn = document.getElementById('join-room');
  const roomDisplay = document.getElementById('room-name');
  const buzzer = document.getElementById('buzzer');
  const status = document.getElementById('status');

  createBtn.addEventListener('click', () => {
    socket = io();
    socket.emit('createRoom');

    socket.on('roomCreated', roomName => {
      currentRoom = roomName;
      username = 'DJ';
      roomDisplay.textContent = `Salle : ${roomName} (DJ)`;
      status.textContent = 'Salle créée. En attente de joueurs...';
      buzzer.disabled = false;
    });

    registerBuzzEvents();
  });

  joinBtn.addEventListener('click', () => {
    const roomInput = document.getElementById('room-input').value.trim();
    const nameInput = document.getElementById('name-input').value.trim();

    if (!roomInput || !nameInput) {
      alert('Merci d’entrer un nom de salle et un pseudo.');
      return;
    }

    socket = io();
    socket.emit('joinRoom', { roomName: roomInput, username: nameInput });

    socket.on('roomJoined', roomName => {
      currentRoom = roomName;
      username = nameInput;
      roomDisplay.textContent = `Salle : ${roomName} (Joueur : ${username})`;
      status.textContent = 'Connecté. Appuie pour buzzer !';
      buzzer.disabled = false;
    });

    socket.on('roomError', msg => {
      alert(msg);
    });

    registerBuzzEvents();
  });

  function registerBuzzEvents() {
    buzzer.addEventListener('click', () => {
      if (socket && currentRoom) {
        socket.emit('buzz', { room: currentRoom, name: username });
        buzzer.disabled = true;
        status.textContent = 'Buzz envoyé !';
      }
    });

    socket.on('buzzed', data => {
      status.textContent = `Le plus rapide : ${data.name}`;
      buzzer.classList.add('buzzed');
      showConfetti();
    });
  }

  function showConfetti() {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
});
