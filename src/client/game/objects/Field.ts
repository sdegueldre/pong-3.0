import * as PIXI from 'pixi.js';
import BaseField from '../../../common/game/objects/BaseField';
import DoubleBall from './bonuses/DoubleBall';
import Ball from './Ball';
import type ClientBallOptions from './Ball';
import type Paddle from './Paddle';

import { norm, sub, mult, normalize } from '../../../common/utils';

const shakeTowards = ({ x, y, power }: Vec2 & { power: number }) => {
  // t: [0;1]
  return (t: number) => {
    const tween = 1 - (2 * t - 1) ** 2;
    const factor = power * tween;
    return { x: factor * x, y: factor * y };
  };
};

export default class Field extends BaseField {
  app: PIXI.Application;
  graphics: PIXI.Graphics;
  scoreText: PIXI.Text;
  balls: Ball[];
  constructor(app: PIXI.Application, players: Paddle[], ballData: Ball, options: Partial<Field>){
    super(options);
    this.app = app;
    this.graphics = new PIXI.Graphics();
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
    this.scoreText = new PIXI.Text('', textSettings);
    const playerName1 = new PIXI.Text(players[0].name, textSettings);
    Object.assign(playerName1, { x: 10, y: 5 });
    const playerName2 = new PIXI.Text(players[1].name, textSettings);
    Object.assign(playerName2, { x: this.w - playerName2.width - 10, y: 5 });

    this.updateScore();
    app.ticker.add(this.update.bind(this));
    this.balls = [new Ball(ballData.x, ballData.y, { velocity: ballData.velocity })];
    this.bonuses = [];
    this.graphics.addChild<PIXI.DisplayObject>(
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
    this.scoreText.x = this.w - this.scoreText.width - 10;
    this.scoreText.y = this.h - this.scoreText.height - 5;
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
    const gameOverText = new PIXI.Text(`${winnerName} wins`, textSettings);
    Object.assign(gameOverText, {
      x: (this.w - gameOverText.width) / 2,
      y: (this.h - gameOverText.height) / 2,
    });
    this.graphics.addChild(gameOverText);
    const exitText = new PIXI.Text("press Escape to return to lobby", {
      fontSize: 24,
      fill: 0xffffff,
      strokeThickness: 4,
    });
    exitText.x = (this.w - exitText.width) / 2;
    exitText.y = (this.h - gameOverText.height) / 2 + gameOverText.height;
    this.graphics.addChild(exitText);
  }
}
