const express = require('express');
const socketIO = require('socket.io');
const Room = require('./Room');

const app = express();
const server = app.listen(process.env.PORT || 3000, listen);
app.use(express.static('dist'));

function listen(){
  console.log('Server listening:', server.address());
};

const io = socketIO(server, {origins: '*:*'});
const connections = new Set();
const rooms = new Map();

function sendRoomList(socket){
  socket.emit('roomList', [...rooms.values()].map(r => ({
    id: r.id,
    name: r.id,
    players: r.players.length,
    maxPlayers: r.maxPlayers,
  })));
};

io.sockets.on('connection', socket => {
  console.log('client connected to socket:', socket.id);
  connections.add(socket);

  socket.on('connect', () => {
    console.log('Client reconnected:', socket.id);
  });

  socket.on('createRoom', () => {
    const room = new Room(socket)
    rooms.set(room.id, room);
    socket.room = room;
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  })

  socket.on('joinRoom', (roomId) => {
    const roomToJoin = rooms.get(roomId);
    if(!roomToJoin){
      socket.emit('roomNotFound', roomId);
      return;
    }
    socket.room = roomToJoin;
    roomToJoin.join(socket);
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  })

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
    if(socket.room){
      socket.room.close();
      rooms.delete(socket.room.id);
    }
    connections.delete(socket);
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  });

  socket.on('getRoomList', () => sendRoomList(socket));
})
