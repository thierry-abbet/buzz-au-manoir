const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

// Génère un nom de salle rigolo
function generateRoomName() {
  const adjectives = ['sombre', 'joyeux', 'mystique', 'ancien', 'bruyant'];
  const nouns = ['manoir', 'troll', 'donjon', 'dragon', 'grimoire'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}-${Math.floor(Math.random() * 1000)}`;
}

// Map des salles et de leurs buzzers
const rooms = {};

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('create-room', callback => {
    const roomName = generateRoomName();
    rooms[roomName] = { firstBuzzer: null };
    socket.join(roomName);
    socket.room = roomName;
    callback(roomName);
    console.log(`Salle créée : ${roomName}`);
  });

  socket.on('join-room', ({ room, name }) => {
    if (!rooms[room]) {
      rooms[room] = { firstBuzzer: null };
    }
    socket.join(room);
    socket.room = room;
    socket.username = name || socket.id;
    console.log(`${socket.username} a rejoint la salle ${room}`);
  });

  socket.on('buzz', () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    if (!rooms[room].firstBuzzer) {
      rooms[room].firstBuzzer = socket.username || socket.id;
      io.to(room).emit('buzzed', { name: rooms[room].firstBuzzer });
    }
  });

  socket.on('reset-buzz', () => {
    const room = socket.room;
    if (room && rooms[room]) {
      rooms[room].firstBuzzer = null;
      io.to(room).emit('reset');
      console.log(`Reset de la salle ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Déconnexion de ${socket.username || socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
