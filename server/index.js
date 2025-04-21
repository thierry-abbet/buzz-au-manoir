// server/index.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { generateRoomName } = require("./utils/names");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const rooms = {}; // { roomName: { dj: socket.id, clients: [socket.id], buzzes: [] } }

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/room", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/room.html"));
});

app.get("/generate-room-name", (req, res) => {
  const roomName = generateRoomName();
  rooms[roomName] = { dj: null, clients: [], buzzes: [] };
  res.json({ roomName });
});

app.get("/check-room", (req, res) => {
  const roomName = req.query.name;
  const exists = !!rooms[roomName];
  res.json({ exists });
});

io.on("connection", (socket) => {
  console.log("Un client s'est connecté");

  socket.on("joinRoom", ({ room, name, isDJ }) => {
    if (!room) return;

    // S'assure que la salle existe
    if (!rooms[room]) {
      socket.emit("roomNotFound");
      return;
    }

    socket.join(room);
    socket.data.name = isDJ ? "DJ" : name || "Anonyme";
    socket.data.room = room;

    if (isDJ) {
      rooms[room].dj = socket.id;
    } else {
      rooms[room].clients.push(socket.id);
    }

    console.log(`${socket.data.name} a rejoint la salle ${room}`);
  });

  socket.on("buzz", () => {
    const displayName = socket.data.name || "Anonyme";
    const room = socket.data.room;
    if (!room || !rooms[room]) return;

    const alreadyBuzzed = rooms[room].buzzes.some(b => b.name === displayName);
    if (!alreadyBuzzed) {
      rooms[room].buzzes.push({ name: displayName });
      io.to(room).emit("buzz", rooms[room].buzzes);
      console.log(`${displayName} a buzzé dans la salle ${room}`);
    }
  });

  socket.on("resetBuzz", () => {
    const room = socket.data.room;
    if (room && rooms[room]) {
      rooms[room].buzzes = [];
      io.to(room).emit("buzz", []);
      console.log(`Buzz réinitialisé pour la salle ${room}`);
    }
  });

  socket.on("disconnect", () => {
    const room = socket.data.room;
    if (room && rooms[room]) {
      if (socket.id === rooms[room].dj) {
        delete rooms[room];
        console.log(`Salle supprimée : ${room}`);
      } else {
        rooms[room].clients = rooms[room].clients.filter(id => id !== socket.id);
      }
    }
    console.log("Un client s'est déconnecté");
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
