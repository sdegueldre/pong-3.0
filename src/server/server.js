const express = require('express');
const socketIO = require('socket.io');
const Room = require('./Room');

const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server listening: on http://localhost:' + port);
});
app.use(express.static('dist'));

const io = socketIO(server, {origins: '*:*'});
const connections = new Set();
const rooms = new Map();

function sendRoomList(socket){
  console.log('sending roomlist to client: ', socket.id);
  socket.emit('roomList', [...rooms.values()].map(r => ({
    id: r.id,
    name: r.name,
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

  socket.on('createRoom', ({name}) => {
    if(socket.room) {
      socket.room.disconnect(socket);
      if (socket.room.players.length === 0) {
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }
    const room = new Room({socket, name});
    rooms.set(room.id, room);
    socket.room = room;
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  })

  socket.on('joinRoom', (roomId) => {
    const roomToJoin = rooms.get(roomId);
    if(!roomToJoin){
      return socket.emit('roomNotFound', roomId);
    }
    if(socket.room) {
      socket.room.disconnect(socket);
      if (socket.room.players.length === 0) {
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }

    socket.room = roomToJoin;
    roomToJoin.join(socket);
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  })

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
    const room = socket.room;
    if(room){
      const playerNumber = room.disconnect(socket);
      if([0,1].includes(playerNumber)) {
        console.log('Closing room: ', socket.room.id);
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }
    connections.delete(socket);
    console.log('sending room list to clients:', [...connections].map(s => s.id));
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  });

  socket.on('getRoomList', () => sendRoomList(socket));
})
