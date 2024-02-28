const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const configureSocketIO = require('./socketIOConfig.js');

const app = express();
const server = http.createServer(app);

const port = 8800;

// CORS middleware to allow requests from all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const io = new Server(server);

configureSocketIO(io);

server.listen(port, () => {
  console.log('Server Started');
});
