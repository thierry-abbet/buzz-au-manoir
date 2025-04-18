const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { customAlphabet } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

// Middleware static
app.use(express.static(path.join(__dirname, '../client')));

// Liste de noms marrants pour les rooms
const adjectives = ['gros', 'petit', 'rapide', 'fourbe', 'rouge', 'bruyant', 'ivre'];
const animals = ['pigeon', 'gobelin', 'licorne', 'raton', 'dragon', 'krokmou', 'crapaud'];

// Générateur de nom de room
function generateRoomName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj}-${animal}-${Math.floor(Math.random() * 100)}`;
}

// Endpoint pour créer une room
app.get('/generate-room', (req, res) => {
  const room = generateRoomName();
  res.json({ room });
});

// Logique des rooms
const buzzedRooms = {};

io.on('connection', socket => {
  socket.on('join', ({ room, name }) => {
    socket.join(room);
    socket.data = { room, name };
    console.log(`${name} a rejoint la salle ${room}`);
  });

  socket.on('buzz', ({ room, name }) => {
    if (!buzzedRooms[room]) {
      buzzedRooms[room] = true;
      io.to(room).emit('buzzed', { name });
      console.log(`${name} a buzzé dans ${room}`);
    }
  });

  socket.on('reset', () => {
    const room = socket.data?.room;
    if (room) {
      buzzedRooms[room] = false;
      io.to(room).emit('reset');
      console.log(`Reset dans la salle ${room}`);
    }
  });

  socket.on('disconnect', () => {
    const { room, name } = socket.data || {};
    if (room && name) {
      console.log(`${name} a quitté la salle ${room}`);
    }
  });
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/room.html'));
});

server.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
