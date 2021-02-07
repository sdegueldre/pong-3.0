const PIXI = require('pixi.js');
const Paddle = require('./components/Paddle');
const Field = require('./components/Field');
const {CollisionParticles} = require('./components/Particles');

module.exports = class Game {
  constructor(controlledPlayer, initialBall, socket, players){
    this.socket = socket;
    this.registeredEvents = [];
    this.particleGroups = [];
    this.gameContainer = document.querySelector('.game-container');
    this.app = new PIXI.Application({
      antialias: true,
      width: 1440,
      height: 1080,
    });
    this.gameContainer.appendChild(this.app.view);

    this.initPlayers(players);
    if(controlledPlayer){
      this.player = controlledPlayer === 1 ? this.player1 : this.player2;
      this.mouseMoved = this.mouseMoved.bind(this);
      window.addEventListener('mousemove', this.mouseMoved);
    }

    window.addEventListener('keydown', this.fullscreenHandler);
    this.fullscreenHandler = this.fullscreenHandler.bind(this);

    this.field = new Field(this.app, [this.player1, this.player2], initialBall, {
      h: this.app.screen.height,
      w: this.app.screen.width,
    });
    console.debug('Game started');

    this.on('ballSync', this.field.setBalls.bind(this.field));
    this.on('playerMove', this.movePlayer.bind(this));
    this.on('playerScored', this.playerScored.bind(this));
    this.on('bonusSpawned', this.field.spawnBonus.bind(this.field));
    this.on('bonusCollected', (bonusesPaddles) => {
      this.field.setBonuses(bonusesPaddles.bonuses);
    });
    this.on('collision', ({pos: {x, y}, vel: {x: vx, y: vy}}) => {
        this.particleGroups.push(new CollisionParticles({
          x, y,
          ticker: this.app.ticker,
          parent: this.field.graphics,
        }));
        this.particleGroups = this.particleGroups.filter(p => p.alive);
        this.app.ticker.addOnce(() => this.field.shake({x: vx, y: vy}));
    });
  }

  setBall(newBall){
    this.field.ball.x = newBall.x;
    this.field.ball.y = newBall.y;
    this.field.ball.velocity = newBall.velocity;
  }

  initPlayers(names){
    this.player1 = new Paddle({
      x: 30,
      y: this.app.screen.height / 2,
    });
    this.player1.name = names[0];

    this.player2 = new Paddle({
      x: this.app.screen.width - 30,
      y: this.app.screen.height / 2,
    });
    this.player2.name = names[1];

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
    if(!this.canvasHeight){
      this.canvasHeight = document.querySelector('canvas').clientHeight;
    }
    this.player.y = e.layerY * 1080 / this.canvasHeight;
    this.socket.emit('playerMove', {y: this.player.y});
  }

  playerScored(ballScore){
    this.field.setBalls.bind(this.field)(ballScore.balls);
    this.field.score = ballScore.score;
    this.field.updateScore();
  }

  fullscreenHandler(e){
    if(e.key === ' '){
      if(document.fullscreen){
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
    }
  }

  on(type, handler){
    this.socket.on(type, handler);
    this.registeredEvents.push(type);
  }

  destroy(){
    this.app.destroy(true, true);
    this.registeredEvents.forEach(type => this.socket.off(type));
    window.removeEventListener('mousemove', this.mouseMoved);
    window.removeEventListener('keydown', this.fullscreenHandler);
  }
};
