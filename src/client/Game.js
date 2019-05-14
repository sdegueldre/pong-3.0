const PIXI = require('pixi.js');
const Paddle = require('./components/Paddle');
const Field = require('./components/Field');
const Ball = require('./components/Ball');

module.exports = class Game {
  constructor(controlledPlayer, initialBall, socket){
    this.socket = socket;
    this.gameContainer = document.querySelector('.game-container');
    this.app = new PIXI.Application({
      antialias: true,
      width: 1440,
      height: 1080
    });
    this.gameContainer.appendChild(this.app.view);

    this.initPlayers();
    this.player = controlledPlayer == 1 ? this.player1 : this.player2;
    this.socket.on('playerMove', this.movePlayer.bind(this));

    console.log('Game started');
    window.addEventListener('mousemove', this.mouseMoved.bind(this));

    this.field = new Field(this.app, [this.player1, this.player2], initialBall, {
      h: this.app.screen.height,
      w: this.app.screen.width
    });

    this.socket.on('ballSync', this.field.setBalls.bind(this.field));
    this.socket.on('playerScored', this.playerScored.bind(this));
    this.socket.on('bonusSpawned', this.field.spawnBonus.bind(this.field));
    this.socket.on('bonusCollected', (bonusesPaddles) => {
      this.field.setBonuses(bonusesPaddles.bonuses);
    });

    window.addEventListener('keydown', this.fullscreenHandler);
  }

  setBall(newBall){
    field.ball.x = newBall.x;
    field.ball.y = newBall.y;
    field.ball.velocity = newBall.velocity;
  }

  initPlayers(){
    this.player1 = new Paddle({
      x: 30,
      y: this.app.screen.height/2
    });

    this.player2 = new Paddle({
      x: this.app.screen.width-30,
      y: this.app.screen.height/2
    });

    this.player1.interactive = true;
    this.player2.interactive = true;
  }

  movePlayer(data){
    switch(data.playerNumber){
      case 1:
        this.player1.y = data.y;
        break;
      case 2:
        this.player2.y = data.y;
        break;
    }
  }

  mouseMoved(e){
    if(!this.canvasHeight)
      this.canvasHeight = document.querySelector('canvas').clientHeight;
    this.player.y = e.layerY*1080/this.canvasHeight;
    this.socket.emit('playerMove', {y: this.player.y});
  }

  playerScored(ballScore){
    this.field.setBalls.bind(this.field)(ballScore.balls);
    this.field.score = ballScore.score;
    this.field.updateScore();
  }

  fullscreenHandler(e){
    if(e.key == ' '){
      if(document.fullscreen)
        document.exitFullscreen();
      else
        this.gameContainer.requestFullscreen();
    }
  }

  destroy(){
    this.app.destroy(true, true);
  }
}
