const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('../client'));

io.on('connection', socket => {
  console.log('User connected:', socket.id);
});

server.listen(3000, () => console.log('Server running on port 3000'));