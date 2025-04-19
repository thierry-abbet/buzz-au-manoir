const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
const path = require('path');
const generateRoomName = require('./utils/names');

const rooms = {};

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/create-room', (req, res) => {
  const roomName = generateRoomName();
  rooms[roomName] = { dj: null, clients: [] };
  res.redirect(`/room?name=${roomName}&dj=true`);
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'room.html'));
});

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ room, name, isDj }) => {
    if (!room || !name) return;

    if (!rooms[room]) {
      socket.emit('roomNotFound');
      return;
    }

    socket.join(room);
    socket.data.name = name;

    if (isDj) {
      rooms[room].dj = socket.id;
    } else {
      rooms[room].clients.push(socket.id);
    }

    socket.on('buzz', () => {
      io.to(room).emit('buzz', socket.data.name || 'Anonyme');
    });

    socket.on('disconnect', () => {
      if (rooms[room]) {
        if (isDj) {
          delete rooms[room];
        } else {
          rooms[room].clients = rooms[room].clients.filter(id => id !== socket.id);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
