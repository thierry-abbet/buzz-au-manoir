const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Stockage des parties
const parties = {}; // { codePartie: { clients: [], buzzed: false, leader: socket.id } }

app.use(express.static(path.join(__dirname, '../client')));

// Création d'une nouvelle partie
app.get('/new', (req, res) => {
  const code = crypto.randomBytes(3).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
  parties[code] = { clients: [], buzzed: false };
  res.json({ code });
});

// Connexion des sockets
io.on('connection', socket => {
  console.log('Nouvelle connexion :', socket.id);

  socket.on('join', ({ code, pseudo }) => {
    if (!parties[code]) {
      socket.emit('error_message', 'Partie introuvable.');
      return;
    }

    socket.join(code);
    socket.code = code;
    socket.pseudo = pseudo;

    parties[code].clients.push(socket);
    console.log(`${pseudo} a rejoint la partie ${code}`);
  });

  socket.on('buzz', () => {
    const code = socket.code;
    if (!code || !parties[code] || parties[code].buzzed) return;

    parties[code].buzzed = true;

    // Annonce du plus rapide
    io.to(code).emit('buzzed', { name: socket.pseudo });

    // Optionnel : réinitialisation automatique après x secondes ?
  });

  socket.on('reset', () => {
    const code = socket.code;
    if (!code || !parties[code]) return;

    parties[code].buzzed = false;
    io.to(code).emit('reset');
  });

  socket.on('disconnect', () => {
    const code = socket.code;
    if (!code || !parties[code]) return;

    parties[code].clients = parties[code].clients.filter(s => s !== socket);
    if (parties[code].clients.length === 0) {
      delete parties[code];
    }
  });
});

server.listen(PORT, () => console.log(`✅ Serveur en ligne sur le port ${PORT}`));
