import * as PIXI from 'pixi.js';
import {Paddle, Field, Particles} from './objects';
const {CollisionParticles} = Particles;

export default class Game {
  constructor(controlledPlayer, initialBall, socket, players){
    this.socket = socket;
    this.registeredEvents = [];
    this.particleGroups = [];
    this.app = new PIXI.Application({
      antialias: true,
      width: 1440,
      height: 1080,
    });
    this.element = this.app.view;

    this.initPlayers(players);
    if(controlledPlayer){
      this.player = controlledPlayer === 1 ? this.player1 : this.player2;
      this.pointerMoved = this.pointerMoved.bind(this);
      window.addEventListener('pointermove', this.pointerMoved);
      window.addEventListener('pointerdown', this.pointerMoved);
      this.resizeHandler = this.resizeHandler.bind(this);
      window.addEventListener('resize', this.resizeHandler);
    }

    window.addEventListener('keydown', this.fullscreenHandler);
    this.fullscreenHandler = this.fullscreenHandler.bind(this);

    this.field = new Field(this.app, [this.player1, this.player2], initialBall, {
      h: this.app.screen.height,
      w: this.app.screen.width,
    });

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

  pointerMoved(e){
    this.player.y = e.layerY * this.app.renderer.screen.height / this.canvasHeight;
    this.socket.emit('playerMove', {y: this.player.y});
  }

  playerScored(ballScore){
    this.field.setBalls.bind(this.field)(ballScore.balls);
    this.field.score = ballScore.score;
    this.field.updateScore();
  }

  resizeHandler(e){
    this.canvasHeight = this.element.clientHeight;
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
    window.removeEventListener('pointermove', this.pointerMoved);
    window.removeEventListener('pointerdown', this.pointerMoved);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', this.fullscreenHandler);
  }
}
