const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

// Stockage des parties
const games = {};

// Serve le client
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  // Création d'une nouvelle partie
  socket.on('create-game', (playerName) => {
    const code = nanoid(6).toLowerCase();
    games[code] = {
      host: socket.id,
      players: {},
      buzzed: false,
    };
    games[code].players[socket.id] = playerName;
    socket.join(code);
    socket.emit('game-created', code);
    console.log(`Partie créée : ${code} par ${playerName}`);
  });

  // Rejoindre une partie existante
  socket.on('join-game', ({ gameCode, playerName }) => {
    const game = games[gameCode];
    if (!game) {
      socket.emit('error-message', 'Partie introuvable');
      return;
    }
    game.players[socket.id] = playerName;
    socket.join(gameCode);
    socket.emit('game-joined');
    console.log(`${playerName} a rejoint la partie ${gameCode}`);
  });

  // Gestion du buzz
  socket.on('buzz', ({ gameCode, name }) => {
    const game = games[gameCode];
    if (!game || game.buzzed) return;
    game.buzzed = true;
    io.to(gameCode).emit('buzzed', { name });
    console.log(`${name} a buzzé dans la partie ${gameCode}`);
  });

  // Réinitialiser le buzz (par l’hôte plus tard)
  socket.on('reset', (gameCode) => {
    const game = games[gameCode];
    if (!game) return;
    game.buzzed = false;
    io.to(gameCode).emit('reset');
  });

  // Déconnexion
  socket.on('disconnect', () => {
    for (const code in games) {
      const game = games[code];
      if (game.players[socket.id]) {
        console.log(`${game.players[socket.id]} a quitté la partie ${code}`);
        delete game.players[socket.id];

        // Si l'hôte quitte, supprimer la partie
        if (socket.id === game.host) {
          delete games[code];
          console.log(`Partie ${code} supprimée (hôte déconnecté)`);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
