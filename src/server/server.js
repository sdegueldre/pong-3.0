const express = require('express');
const socketIO = require('socket.io');
const Room = require('./Room');

if(process.argv.includes('--watch')){
  const {spawn} = require('child_process');
  const watcher = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ['run', 'watch']);
  watcher.stdout.on('data', data => console.debug(`${data}`));
  watcher.stderr.on('data', data => console.error(`E: ${data}`));
  watcher.on('error', error => {
    console.error(error);
    process.exit(1);
  });
  watcher.on('exit', code => {
    console.warn('Watcher exited with code', code);
  });
}

const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.debug('Server listening: on http://localhost:' + port);
});
app.use(express.static('dist'));

const io = socketIO(server, {origins: '*:*'});
const connections = new Set();
const rooms = new Map();
let playersCounter = 0;
let roomsCounter = 0;

function sendRoomList(socket){
  socket.emit(
    'roomList',
    [...rooms.values()]
      .filter(r => r.isPublic || r.players.includes(socket))
      .map(r => ({
        id: r.id,
        name: r.name,
        players: r.players.length,
        maxPlayers: r.maxPlayers,
        isPublic: r.isPublic
      })),
  );
}

io.sockets.on('connection', socket => {
  console.debug('client connected to socket:', socket.id);
  connections.add(socket);

  socket.on('connect', () => {
    console.warn('Client reconnected:', socket.id);
  });

  socket.on('setUserName', name => {
    const inputName = name.trim().slice(0, 25);
    if(inputName){
      socket.userName = inputName;
    } else {
      playersCounter++;
      socket.userName = `Player-${playersCounter}`;
      socket.emit('updateUserName', socket.userName);
    }
  });

  socket.on('createRoom', ({name, isPublic = true}) => {
    if(socket.room){
      socket.room.disconnect(socket);
      if(socket.room.players.length === 0){
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }
    roomsCounter++;
    const roomName = name.trim().slice(0, 50);
    const room = new Room({socket, name: roomName || `Room-${roomsCounter}`, isPublic});
    rooms.set(room.id, room);
    socket.room = room;
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  });

  socket.on('joinRoom', (roomId) => {
    const roomToJoin = rooms.get(roomId);
    if(!roomToJoin){
      return socket.emit('roomNotFound', roomId);
    }
    if(socket.room){
      socket.room.disconnect(socket);
      if(socket.room.players.length === 0){
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }

    socket.room = roomToJoin;
    roomToJoin.join(socket);
    connections.forEach(socket => {
      sendRoomList(socket);
    });
  });

  socket.on('disconnect', () => {
    console.debug('client disconnected:', socket.id);
    const room = socket.room;
    if(room){
      const playerNumber = room.disconnect(socket);
      if([0, 1].includes(playerNumber)){
        console.debug('Closing room: ', socket.room.id);
        socket.room.close();
        rooms.delete(socket.room.id);
      }
    }
    connections.delete(socket);
    connections.forEach(socket => sendRoomList(socket));
  });

  socket.on('getRoomList', () => sendRoomList(socket));
});
