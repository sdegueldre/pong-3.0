const PIXI = require('pixi.js');
const BaseField = require('../../common/BaseField');
const Ball = require('./Ball');

module.exports = class Field extends BaseField {
  constructor(app, players, ballData, options){
    super(players, options);
    this.graphics = new PIXI.Graphics();
    for(let i = 0; i*50 < this.h; i++){
      this.graphics.beginFill(0xFFFFFF);
    	this.graphics.drawRect(this.w/2 - 2.5, 50*i + 10, 5, 30);
      this.graphics.endFill();
    }
    this.scoreText = new PIXI.Text('', {
      fontSize: 28,
      fill: 0xffffff,
    });
    this.updateScore();
    this.stage = app.stage;
    app.ticker.add(this.update.bind(this));
    this.balls[0] = new Ball(ballData.x, ballData.y, {velocity: ballData.velocity});
    this.stage.addChild(this.graphics, players[0].graphics, players[1].graphics, this.scoreText, this.balls[0].graphics,)
  }

  updateScore(){
    this.scoreText.text = `${this.score.player1} - ${this.score.player2}`;
    this.scoreText.x = this.w - this.scoreText.width - 10;
    this.scoreText.y = this.h - this.scoreText.height - 5;
  }

  setBalls(balls){
    // Remove all balls from the stage
    this.stage.removeChildren(4);
    // Create new balls from the server data
    this.balls = balls.map(ballData => new Ball(ballData.x, ballData.y, {velocity: ballData.velocity}));
    // Add the balls back to the stage
    this.stage.addChild(...this.balls.map(b => b.graphics));
  }
}
