// server/index.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const generateRoomName = require("./utils/names");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const rooms = {}; // { roomName: { dj: socket.id, clients: [socket.id] } }

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/room", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/room.html"));
});

app.get("/generate-room-name", (req, res) => {
  const roomName = generateRoomName();
  res.json({ roomName });
});

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    const roomName = generateRoomName();
    rooms[roomName] = { dj: socket.id, clients: [] };
    socket.join(roomName);
    socket.data.name = "DJ";
    socket.emit("roomCreated", roomName);
    console.log(`Nouvelle salle créée : ${roomName}`);
  });

  socket.on("joinRoom", ({ room, name, isDj }) => {
    if (!room) return;

    // Vérifie si la salle existe
    if (!rooms[room]) {
      socket.emit("roomNotFound");
      return;
    }

    // Si le nom n'est pas encore fourni (client), on confirme que la salle existe
    if (!name && !isDj) {
      socket.emit("roomOk");
      return;
    }

    socket.join(room);
    socket.data.name = name || "Anonyme";

    if (isDj) {
      rooms[room].dj = socket.id;
    } else {
      rooms[room].clients.push(socket.id);
    }

    socket.on("buzz", () => {
      const displayName = socket.data.name || "Anonyme";
      io.to(room).emit("buzz", displayName);
      console.log(`${displayName} a buzzé dans la salle ${room}`);
    });

    socket.on("disconnect", () => {
      if (rooms[room]) {
        if (isDj) {
          delete rooms[room];
          console.log(`Salle supprimée : ${room}`);
        } else {
          rooms[room].clients = rooms[room].clients.filter((id) => id !== socket.id);
        }
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
