// import express and http
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const configureSocketIO = require('./socketIOConfig.js');
const cors = require('cors')

// import configureSocketIO from "./socketIOConfig"
const app = express();
const server = http.createServer(app);
app.use(cors());
const port = process.env.port || 8800;

const io = new Server(server, {
  cors: {  
    origin: 'https://speedcraft.vercel.app',
    methods: ['GET','POST']
  },
});



configureSocketIO(io); 
    

server.listen(port, () => {
  console.log('Server Started');
});