const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const parties = {}; // { roomCode: { djId, clients: [] } }

app.use(express.static(path.join(__dirname, '../public')));
//app.use(express.static('public'));

// Redirige /room vers le bon fichier room.html
app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/room.html'));
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion :', socket.id);

  socket.on('createRoom', () => {
    const code = nanoid(6);
    parties[code] = { djId: socket.id, clients: [] };
    socket.join(code);
    socket.emit('roomCreated', code);
    console.log(`Salle créée : ${code}`);
  });

  socket.on('joinRoom', ({ code, pseudo }) => {
    const party = parties[code];
    if (party) {
      socket.join(code);
      party.clients.push({ id: socket.id, pseudo });
      socket.emit('joinedRoom', { code });
    } else {
      socket.emit('error', 'Salle introuvable');
    }
  });

  socket.on('buzz', ({ code, pseudo }) => {
    const party = parties[code];
    if (!party || party.buzzed) return;
    party.buzzed = true;
    io.to(code).emit('buzzed', { pseudo });
  });

  socket.on('reset', (code) => {
    const party = parties[code];
    if (party) {
      delete party.buzzed;
      io.to(code).emit('reset');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
