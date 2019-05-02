const Field = require ('../common/BaseField');
const Paddle = require ('../common/BasePaddle');
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
    this.tickers = [];
    console.log('Created room with id', this.id);
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
      player.paddle = new Paddle({
        x: player.playerNumber == 1 ? 30 : 800-30,
        y: 300
      });
      player.on('playerMove', (position) => this.movePlayer(player, position));
    }
    this.field = new Field(this.players.map(player => player.paddle));
    this.broadcast('gameStarted', this.field.balls[0]);
    this.broadcast('bonusSpawned', this.field.bonuses[0]);
    setInterval(() => {
      this.broadcast('ballSync', this.field.balls);
    }, 50);
    this.field.on('outOfField', () => {
      this.broadcast('playerScored', {
        balls: this.field.balls,
        score: this.field.score
      });
    });
    this.field.on('bonusCollected', () => {
      this.field.addBonus();
      this.broadcast('bonusCollected', {
        bonuses: this.field.bonuses,
        players: this.players.map(p => p.paddle)
      });
    })
    this.tick(this.field);
  }

  movePlayer(player, position){
    this.players[player.playerNumber-1].paddle.y = position.y;
    for(let otherPlayer of this.players){
      if(player == otherPlayer)
        continue;
      otherPlayer.emit('playerMove', {
        playerNumber: player.playerNumber,
        y: player.paddle.y
      });
    }
  }

  tick(object){
    let lastTick = Date.now();
    this.tickers.push(setInterval(() => {
      let now = Date.now();
      let dt = now - lastTick;
      lastTick = now;
      object.update.bind(object)(dt/16.667);
    }, 10));
  }

  broadcast(type, data){
    for(let player of this.players)
      player.emit(type, data);
  }

  close(){
    console.log('Closing room with id', this.id);
    this.broadcast('roomClosed');
    for(let ticker of this.tickers)
      clearInterval(ticker);
    for(let player of this.players){
      player.disconnect();
    }
  }
}
