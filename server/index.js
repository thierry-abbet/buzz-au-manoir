const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// On sert le dossier client
app.use(express.static(path.join(__dirname, '../client')));

// Structure pour stocker l’état des rooms
const rooms = {};

// Lorsqu'un client se connecte
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // Création de la room par le DJ
  socket.on('createRoom', roomName => {
    socket.join(roomName);
    rooms[roomName] = {
      dj: socket.id,
      players: {},
      buzzed: false
    };
    console.log(`Room créée : ${roomName}`);
  });

  // Un joueur rejoint une room
  socket.on('joinRoom', ({ room, name }) => {
    if (!rooms[room]) {
      rooms[room] = {
        dj: null,
        players: {},
        buzzed: false
      };
    }
    socket.join(room);
    rooms[room].players[socket.id] = name;
    console.log(`${name} a rejoint la room ${room}`);
  });

  // Un joueur buzz
  socket.on('buzz', ({ room, name }) => {
    if (!rooms[room]) return;
    if (!rooms[room].buzzed) {
      rooms[room].buzzed = true;
      io.to(room).emit('buzzed', { name });
      console.log(`${name} a buzzé en premier dans la room ${room}`);
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    for (const room in rooms) {
      delete rooms[room].players?.[socket.id];
      // Optionnel : supprimer la room si plus personne ?
    }
    console.log('User disconnected:', socket.id);
  });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
