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
  res.json({ name: roomName });
});

app.get("/check-room", (req, res) => {
  const name = req.query.name;
  res.json({ exists: !!rooms[name] });
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ room, name, isDJ }) => {
    if (!room) return;

    if (!rooms[room]) {
      if (isDJ) {
        rooms[room] = { dj: socket.id, clients: [], buzzes: [] };
        socket.join(room);
        socket.data.name = "DJ";
        socket.data.room = room;
        io.to(room).emit("updateParticipants", getParticipantNames(room));
        console.log(`Salle créée : ${room}`);
      } else {
        socket.emit("roomNotFound");
      }
      return;
    }

    if (!name && !isDJ) {
      socket.emit("roomOk");
      return;
    }

    socket.join(room);
    socket.data.name = name || "Anonyme";
    socket.data.room = room;

    if (isDJ) {
      rooms[room].dj = socket.id;
    } else {
      rooms[room].clients.push(socket.id);
      io.to(room).emit("updateParticipants", getParticipantNames(room));
    }

    socket.on("buzz", () => {
      const displayName = socket.data.name || "Anonyme";
      const roomName = socket.data.room;
      if (!rooms[roomName]) return;

      const alreadyBuzzed = rooms[roomName].buzzes.some((b) => b.name === displayName);
      if (!alreadyBuzzed) {
        rooms[roomName].buzzes.push({ name: displayName });
        io.to(roomName).emit("buzz", rooms[roomName].buzzes);
        console.log(`${displayName} a buzzé dans la salle ${roomName}`);
      }
    });

    socket.on("resetBuzz", () => {
      const roomName = socket.data.room;
      if (rooms[roomName]) {
        rooms[roomName].buzzes = [];
        io.to(roomName).emit("buzz", []);
        console.log(`Buzz réinitialisé pour la salle ${roomName}`);
      }
    });

    socket.on("disconnect", () => {
      const roomName = socket.data.room;
      if (rooms[roomName]) {
        if (isDJ) {
          delete rooms[roomName];
          console.log(`Salle supprimée : ${roomName}`);
        } else {
          rooms[roomName].clients = rooms[roomName].clients.filter((id) => id !== socket.id);
          io.to(roomName).emit("updateParticipants", getParticipantNames(roomName));
        }
      }
    });
  });
});

function getParticipantNames(room) {
  const clientIds = rooms[room]?.clients || [];
  return clientIds.map((id) => io.sockets.sockets.get(id)?.data?.name || "Anonyme");
}

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
