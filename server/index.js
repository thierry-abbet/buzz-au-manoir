const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 10000;

// Dictionnaire des parties : { codePartie: { joueurs: [], aBuzzé: false } }
const parties = {};

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", (socket) => {
  console.log("Un joueur s'est connecté");

  // Rejoindre une partie
  socket.on("joinRoom", ({ pseudo, room }) => {
    socket.join(room);
    socket.pseudo = pseudo;
    socket.room = room;

    if (!parties[room]) {
      parties[room] = { joueurs: [], aBuzzé: false };
    }

    parties[room].joueurs.push(socket);

    console.log(`> ${pseudo} a rejoint la partie ${room}`);
    socket.emit("joined", { pseudo, room });
  });

  // Gestion du buzz
  socket.on("buzz", ({ pseudo, room }) => {
    const partie = parties[room];

    if (partie && !partie.aBuzzé) {
      partie.aBuzzé = true;
      console.log(`💥 BUZZ ! ${pseudo} dans la partie ${room}`);
      io.to(room).emit("buzzed", { pseudo });
    }
  });

  // Réinitialisation depuis le DJ
  socket.on("reset", ({ room }) => {
    if (parties[room]) {
      parties[room].aBuzzé = false;
      io.to(room).emit("resetBuzz");
      console.log(`🔄 Reset du buzz dans la partie ${room}`);
    }
  });

  // Création de partie par le DJ
  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();
    parties[roomCode] = { joueurs: [], aBuzzé: false };
    socket.emit("roomCreated", { room: roomCode });
    console.log(`🏪 Partie créée : ${roomCode}`);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    const { room } = socket;
    if (room && parties[room]) {
      parties[room].joueurs = parties[room].joueurs.filter((s) => s !== socket);
      console.log(`${socket.pseudo} a quitté la partie ${room}`);

      if (parties[room].joueurs.length === 0) {
        delete parties[room]; // Nettoyage
        console.log(`🪩 Partie ${room} supprimée car vide`);
      }
    }
  });
});

function generateRoomCode() {
  const adjectives = ["epic", "mystic", "crazy", "wild", "silly"];
  const nouns = ["goblin", "dragon", "wizard", "bard", "orc"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}-${Math.floor(Math.random() * 1000)}`;
}

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
