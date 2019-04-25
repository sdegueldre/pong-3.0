//const Ball = require ('../common/Ball')
const uuid = require('uuid/v1');

module.exports = class Room {
  constructor(socket){
    this.owner = socket;
    this.owner.playerNumber = 1;
    this.id = uuid();
    this.owner.emit('roomCreated', this.id);
    this.players = [this.owner];
    this.maxPlayers = 2;
    this.minPlayers = 2;
  }

  join(socket){
    if(this.players.length >= this.maxPlayers){
      socket.emit('failedToJoin');
      return;
    }
    socket.playerNumber = this.players.length + 1;
    this.players.push(socket);
    socket.emit('joinedRoom');

    if(this.players.length >= this.minPlayers)
      this.startGame();
  }

  startGame(){
    console.log('Enough players have joined the room: starting the game...');
    for(let player of this.players){
      player.emit('gameStarted');
      player.on('playerMove',(position) => movePlayer(player, position) );
    }
  }

  movePlayer(player, position){
    this.players[playerNumber-1].position = position;
    for(let otherPlayer of this.players){
      if(player == otherPlayer)
        continue;
      otherPlayer.emit('playerMove', {
        playerNumber: player.playerNumber,
        y: player.position.y
      });
    }
  }



  createBall(){

  }
}
