const express = require('express');
const socketIO = require('socket.io');
const Room = require('./Room');

const app = express();
const server = app.listen(process.env.PORT || 3000, listen)

function listen(){
  console.log('Server listening:', server.address());
}

const io = socketIO(server, {origins: '*:*'});
let connections = [];
let rooms = [];

io.sockets.on('connection', (socket) => {
  console.log('client connected to socket:', socket.id);
  connections.push(socket);


  socket.on('connect', () => {
    console.log('Client reconnected:', socket.id);
  });

  socket.on('createRoom', () => {
    rooms.push(new Room(socket));
  })

  socket.on('joinRoom', (roomId) => {
    const roomToJoin = rooms.find((room) => room.id = roomId);
    if(!roomToJoin){
      socket.emit('roomNotFound', roomId);
      return;
    }
    roomToJoin.join(socket);
  })

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
    connections.splice(connections.indexOf(socket), 1);
  })
})
