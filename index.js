const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Replace this with your actual frontend origin
const frontendOrigin = 'https://speedcraft.vercel.app';

app.use(cors({
  origin: frontendOrigin,
  methods: ['GET', 'POST'],
}));

const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ['GET', 'POST'],
  },
});

const configureSocketIO = require('./socketIOConfig.js');
configureSocketIO(io);

const port = process.env.PORT || 8800;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
