import * as PIXI from 'pixi.js';
import {BaseField} from '/../common/game/objects';
import {DoubleBall} from './bonuses';
import Ball from './Ball';

const {norm, sub, mult, normalize} = require('/../common/utils');

const shakeTowards = ({x, y, power}) => {
  // t: [0;1]
  return (t) => {
    const tween = 1 - (2 * t - 1) ** 2;
    const factor = power * tween;
    return {x: factor * x, y: factor * y};
  };
};

export default class Field extends BaseField {
  constructor(app, players, ballData, options){
    super(players, options);
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
    this.playerScore1 = new PIXI.Text('', textSettings);
    this.playerScore1.anchor.set(1, 0); // top right
    Object.assign(this.playerScore1, {x: this.w / 2 - 30, y: 5});
    this.playerScore2 = new PIXI.Text('', textSettings);
    this.playerScore2.anchor.set(0, 0); // top left
    Object.assign(this.playerScore2, {x: this.w / 2 + 30, y: 5});

    const playerName1 = new PIXI.Text(players[0].name, textSettings);
    playerName1.anchor.set(1, 0); // top right
    Object.assign(playerName1, {x: this.w / 2 - 150, y: 5});
    const playerName2 = new PIXI.Text(players[1].name, textSettings);
    playerName2.anchor.set(0, 0); // top left
    Object.assign(playerName2, {x: this.w / 2 + 150, y: 5});

    this.updateScore();
    app.ticker.add(this.update.bind(this));
    this.balls[0] = new Ball(ballData.x, ballData.y, {velocity: ballData.velocity});
    this.bonuses = [];
    this.graphics.addChild(
      players[0].graphics,
      players[1].graphics,
      this.balls[0].graphics,
      this.playerScore1,
      this.playerScore2,
      playerName1,
      playerName2,
    );
    app.stage.addChild(this.graphics);
  }

  updateScore(){
    this.playerScore1.text = this.score.player1;
    this.playerScore2.text = this.score.player2;
  }

  setBalls(balls){
    // Remove all balls from the field
    this.balls.forEach(b => this.graphics.removeChild(b.graphics));
    // Create new balls from the server data
    this.balls = balls.map(ballData => new Ball(ballData.x, ballData.y, {
      velocity: ballData.velocity,
    }));
    // Add the balls back to the field
    this.balls.forEach(b => this.graphics.addChild(b.graphics));
  }

  spawnBonus(bonusData){
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

  removeBall(ball){
    super.removeBall(ball);
    this.graphics.removeChild(ball.graphics);
  }

  removeBonus(bonus){
    super.removeBonus(bonus);
    this.graphics.removeChild(bonus.graphics);
  }

  setBonuses(bonusesPaddles){
    this.bonuses.forEach(b => this.graphics.removeChild(b.graphics));
    this.bonuses = bonusesPaddles.bonuses.map(b => new DoubleBall(b.x, b.y));
    this.bonuses.forEach(b => this.graphics.addChild(b.graphics));
  }

  shake({x, y}){
    const {app} = this;
    const threshold = 15;
    if(norm({x, y}) < threshold){
      return;
    }
    const shake = sub({x, y}, mult(threshold, normalize({x, y})));
    const shaker = shakeTowards({...shake, power: 1});
    const start = Date.now();
    const duration = 50; // ms
    let delta = {x: 0, y: 0};
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
}
