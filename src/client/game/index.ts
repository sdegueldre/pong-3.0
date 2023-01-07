import { Application } from "./engine/Application";
import Paddle from './objects/Paddle';
import Field from "./objects/Field";
import type ClientBallOptions from './objects/Ball';
import CollisionParticles from './objects/Particles';
import type { Socket } from "socket.io-client";

type GameSetter = (game: null) => void;

export default class Game {
  socket: Socket;
  registeredEvents: string[];
  particleGroups: CollisionParticles[];
  app: Application;
  element: HTMLCanvasElement;
  field: Field;
  player1: Paddle;
  player2: Paddle;
  player?: Paddle;
  canvasHeight: number;
  constructor(controlledPlayer: number, initialBall: ClientBallOptions, socket: Socket, players: string[], setGame: GameSetter){
    this.socket = socket;
    this.registeredEvents = [];
    this.particleGroups = [];
    this.app = new Application({
      antialias: true,
      width: 1440,
      height: 1080,
    });
    this.element = this.app.view;

    this.player1 = new Paddle({
      x: 30,
      y: this.app.screen.height / 2,
      name: players[0],
    });

    this.player2 = new Paddle({
      x: this.app.screen.width - 30,
      y: this.app.screen.height / 2,
      name: players[1],
    });

    if(controlledPlayer){
      this.player = controlledPlayer === 1 ? this.player1 : this.player2;
      this.pointerMoved = this.pointerMoved.bind(this);
      window.addEventListener('pointermove', this.pointerMoved);
      window.addEventListener('pointerdown', this.pointerMoved);
    }

    this.fullscreenHandler = this.fullscreenHandler.bind(this);
    window.addEventListener('keydown', this.fullscreenHandler);

    this.field = new Field(this.app, [this.player1, this.player2], initialBall, {
      h: this.app.screen.height,
      w: this.app.screen.width,
    });

    this.on('ballSync', this.field.setBalls.bind(this.field));
    this.on('playerMove', this.movePlayer.bind(this));
    this.on('playerScored', this.playerScored.bind(this));
    this.on('bonusSpawned', this.field.spawnBonus.bind(this.field));
    this.on('bonusCollected', (bonusesPaddles: { bonuses: Vec2[] }) => {
      this.field.setBonuses(bonusesPaddles.bonuses);
    });
    this.on('collision', ({ pos: { x, y }, vel: { x: vx, y: vy } }: { pos: Vec2, vel: Vec2 }) => {
      this.particleGroups.push(new CollisionParticles({
        x, y,
        ticker: this.app.ticker,
        parent: this.field.graphics,
      }));
      this.particleGroups = this.particleGroups.filter(p => p.alive);
      this.app.ticker.addOnce(() => this.field.shake({ x: vx, y: vy }));
    });
    this.on('gameOver', (winner: string) => {
      this.field.gameOver(winner);
      const onKeydown = (ev: KeyboardEvent) => {
        if(ev.key === "Escape"){
          window.removeEventListener("keydown", onKeydown);
          this.destroy();
          setGame(null);
        }
      };
      window.addEventListener("keydown", onKeydown);
    });
    this.canvasHeight = 0;
    this.fullscreenHandler;
  }

  movePlayer(data: { playerNumber: number, y: number }){
    switch(data.playerNumber){
      case 1:
        this.player1.y = data.y;
        break;
      case 2:
        this.player2.y = data.y;
        break;
    }
  }

  pointerMoved(e: MouseEvent){
    this.player!.y = e.clientY * this.app.screen.height / this.element.clientHeight;
    this.socket.emit('playerMove', { y: this.player!.y });
  }

  playerScored(ballScore: { balls: ClientBallOptions[], score: { player1: number, player2: number }}){
    this.field.setBalls(ballScore.balls);
    this.field.score = ballScore.score;
    this.field.updateScore();
  }

  fullscreenHandler(e: KeyboardEvent){
    if(e.key === ' '){
      if(document.fullscreen){
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
    }
  }

  resizeHandler(){
    this.canvasHeight = this.element.clientHeight;
  }

  on(type: string, handler: (arg: any) => void){
    this.socket.on(type, handler);
    this.registeredEvents.push(type);
  }

  destroy(){
    this.app.destroy();
    this.registeredEvents.forEach(type => this.socket.off(type));
    this.socket.emit("leaveRoom");
    window.removeEventListener('pointermove', this.pointerMoved);
    window.removeEventListener('pointerdown', this.pointerMoved);
    window.removeEventListener('keydown', this.fullscreenHandler);
  }
}
