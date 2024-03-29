import { Graphics } from "../engine/Graphics";
import { Text } from "../engine/Text";
import BaseField from '../../../common/game/objects/BaseField';
import DoubleBall from './bonuses/DoubleBall';
import Ball from './Ball';
import { norm, sub, mult, normalize } from '../../../common/utils';

import type { Application } from "../engine/Application";
import type ClientBallOptions from './Ball';
import type Paddle from './Paddle';

const shakeTowards = ({ x, y, power }: Vec2 & { power: number }) => {
  // t: [0;1]
  return (t: number) => {
    const tween = 1 - (2 * t - 1) ** 2;
    const factor = power * tween;
    return { x: factor * x, y: factor * y };
  };
};

export default class Field extends BaseField {
  app: Application;
  graphics: Graphics;
  scoreText: Text;
  balls: Ball[];
  constructor(app: Application, players: Paddle[], ballData: Ball, options: Partial<Field>){
    super(options);
    this.app = app;
    this.graphics = new Graphics();
    this.graphics.lineStyle(2, 0xFFFFFF);
    this.graphics.drawRect(2, 2, this.w - 2, this.h - 2);
    this.graphics.lineStyle(0, 0xFFFFFF);
    for(let i = 0; i * 50 < this.h; i++){
      this.graphics.beginFill(0xFFFFFF);
      this.graphics.drawRect(this.w / 2 - 2.5, 50 * i + 10, 5, 30);
      this.graphics.endFill();
    }
    const textSettings = {
      fontSize: 28,
      fill: 0xffffff,
      strokeThickness: 4,
    };
    this.scoreText = new Text('', textSettings);
    Object.assign(this.scoreText, { y: this.h - 5, x: this.w - 10, textBaseline: "bottom", textAlign: "right" });
    const playerName1 = new Text(players[0].name, textSettings);
    Object.assign(playerName1, { x: 10, y: 10, textAlign: "left", textBaseline: "top" });
    const playerName2 = new Text(players[1].name, textSettings);
    Object.assign(playerName2, { x: this.w - 10, y: 10, textAlign: "right", textBaseline: "top" });

    this.updateScore();
    app.ticker.add(this.update.bind(this));
    this.balls = [new Ball(ballData.x, ballData.y, { velocity: ballData.velocity })];
    this.bonuses = [];
    this.graphics.addChild(
      players[0].graphics,
      players[1].graphics,
      this.balls[0].graphics,
      this.scoreText,
      playerName1,
      playerName2,
    );
    app.stage.addChild(this.graphics);
  }

  updateScore(){
    this.scoreText.text = `${this.score.player1} - ${this.score.player2}`;
  }

  setBalls(balls: ClientBallOptions[]){
    // Remove all balls from the field
    this.balls.forEach(b => this.graphics.removeChild(b.graphics));
    // Create new balls from the server data
    this.balls = balls.map(ballData => new Ball(ballData.x, ballData.y, {
      velocity: ballData.velocity,
    }));
    // Add the balls back to the field
    this.balls.forEach(b => this.graphics.addChild(b.graphics));
  }

  spawnBonus(bonusData: Vec2 & { type: string }){
    switch(bonusData.type){
      case 'DoubleBall':{
        const bonus = new DoubleBall(bonusData.x, bonusData.y);
        this.bonuses.push(bonus);
        this.graphics.addChild(bonus.graphics);
        break;
      }
      default:
        console.warn('Tried to spawn unknown bonus: ', bonusData.type);
    }
  }

  removeBall(ball: Ball){
    super.removeBall(ball);
    this.graphics.removeChild(ball.graphics);
  }

  removeBonus(bonus: DoubleBall){
    super.removeBonus(bonus);
    this.graphics.removeChild(bonus.graphics);
  }

  setBonuses(bonuses: Vec2[]){
    this.bonuses.forEach(b => this.graphics.removeChild(b.graphics));
    this.bonuses = bonuses.map(b => new DoubleBall(b.x, b.y));
    this.bonuses.forEach(b => this.graphics.addChild(b.graphics));
  }

  shake({ x, y }: Vec2){
    const { app } = this;
    const threshold = 15;
    if(norm({ x, y }) < threshold){
      return;
    }
    const shake = sub({ x, y }, mult(threshold, normalize({ x, y })));
    const shaker = shakeTowards({ ...shake, power: 1 });
    const start = Date.now();
    const duration = 50; // ms
    let delta = { x: 0, y: 0 };
    const updater = () => {
      this.graphics.x -= delta.x;
      this.graphics.y -= delta.y;
      const tween = (Date.now() - start) / duration;
      if(tween > 1){
        return app.ticker.remove(updater);
      }
      delta = shaker(tween);
      this.graphics.x += delta.x;
      this.graphics.y += delta.y;
    };
    app.ticker.add(updater);
  }

  gameOver(winnerName: string){
    const textSettings = {
      fontSize: 50,
      fill: 0xffffff,
      strokeThickness: 4,
    };
    const gameOverText = new Text(`${winnerName} wins`, textSettings);
    Object.assign(gameOverText, {
      x: this.w / 2,
      y: this.h / 2 - 5,
      textBaseline: "bottom",
    });
    this.graphics.addChild(gameOverText);
    const exitText = new Text("press Escape to return to lobby", {
      fontSize: 24,
      fill: 0xffffff,
      strokeThickness: 4,
    });
    Object.assign(exitText, {
      x: this.w / 2,
      y: this.h / 2 + 5,
      textBaseline: "top",
    });
    this.graphics.addChild(exitText);
  }
}
