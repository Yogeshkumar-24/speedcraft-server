// import express and http
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const configureSocketIO = require('./socketIOConfig.js');

// import configureSocketIO from "./socketIOConfig"
const app = express();
const server = http.createServer(app);

const port = 8800;

const io = new Server(server, {
  cors: {  
    origin: '*',
  },
});



configureSocketIO(io); 
    

server.listen(port, () => {
  console.log('Server Started');
});