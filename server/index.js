// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { generateRoomName } = require("./utils/names");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

app.use(express.static(path.join(__dirname, "../public")));

app.get("/room", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/room.html"));
});

io.on("connection", (socket) => {
  socket.on("create-room", () => {
    const roomName = generateRoomName();
    rooms[roomName] = { dj: socket.id, clients: [] };
    socket.join(roomName);
    socket.emit("room-created", roomName);
  });

  socket.on("join-room", ({ roomName, pseudo }) => {
    if (!rooms[roomName]) return socket.emit("room-error", "Room not found");
    rooms[roomName].clients.push({ id: socket.id, pseudo });
    socket.join(roomName);
    socket.to(roomName).emit("user-joined", pseudo);
  });

  socket.on("buzz", ({ roomName, pseudo }) => {
    if (!rooms[roomName]) return;
    if (!rooms[roomName].buzzed) {
      rooms[roomName].buzzed = true;
      io.to(roomName).emit("buzzed", pseudo || "Anonyme");
    }
  });

  socket.on("reset", (roomName) => {
    if (rooms[roomName] && rooms[roomName].dj === socket.id) {
      rooms[roomName].buzzed = false;
      io.to(roomName).emit("reset-buzz");
    }
  });

  socket.on("disconnecting", () => {
    for (const roomName of socket.rooms) {
      if (rooms[roomName]) {
        rooms[roomName].clients = rooms[roomName].clients.filter(c => c.id !== socket.id);
        if (rooms[roomName].dj === socket.id) {
          delete rooms[roomName];
          io.to(roomName).emit("room-closed");
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
