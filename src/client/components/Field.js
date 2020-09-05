const PIXI = require('pixi.js');
const BaseField = require('../../common/BaseField');
const Ball = require('./Ball');
const DoubleBall = require('./bonuses/DoubleBall');

module.exports = class Field extends BaseField {
  constructor(app, players, ballData, options){
    super(players, options);
    this.graphics = new PIXI.Graphics();
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
    Object.assign(playerName1, {x: 10, y: 5});
    const playerName2 = new PIXI.Text(players[1].name, textSettings);
    Object.assign(playerName2, {x: this.w - playerName2.width - 10, y: 5});

    this.updateScore();
    this.stage = app.stage;
    app.ticker.add(this.update.bind(this));
    this.balls[0] = new Ball(ballData.x, ballData.y, {velocity: ballData.velocity});
    this.bonuses = [];
    this.stage.addChild(
      this.graphics,
      players[0].graphics,
      players[1].graphics,
      this.balls[0].graphics,
      this.scoreText,
      playerName1,
      playerName2,
    );
  }

  updateScore(){
    this.scoreText.text = `${this.score.player1} - ${this.score.player2}`;
    this.scoreText.x = this.w - this.scoreText.width - 10;
    this.scoreText.y = this.h - this.scoreText.height - 5;
  }

  setBalls(balls){
    // Remove all balls from the stage
    this.balls.forEach(b => this.stage.removeChild(b.graphics));
    // Create new balls from the server data
    this.balls = balls.map(ballData => new Ball(ballData.x, ballData.y, {
      velocity: ballData.velocity,
    }));
    // Add the balls back to the stage
    this.balls.forEach(b => this.stage.addChild(b.graphics));
  }

  spawnBonus(bonusData){
    switch(bonusData.type){
      case 'DoubleBall':{
        const bonus = new DoubleBall(bonusData.x, bonusData.y);
        this.bonuses.push(bonus);
        this.stage.addChild(bonus.graphics);
        break;
      }
      default:
        console.warn('Tried to spawn unknown bonus: ', bonusData.type);
    }
  }

  removeBall(ball){
    super.removeBall(ball);
    this.stage.removeChild(ball.graphics);
  }

  removeBonus(bonus){
    super.removeBonus(bonus);
    this.stage.removeChild(bonus.graphics);
  }

  setBonuses(bonuses){
    this.bonuses.forEach(b => this.stage.removeChild(b.graphics));
    this.bonuses = bonuses.map(b => new DoubleBall(b.x, b.y));
    this.bonuses.forEach(b => this.stage.addChild(b.graphics));
  }
};
