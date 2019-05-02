
module.exports = class BonusTemplate{
  constructor(){
    this.radius = 30;
    this.player = null;
  }

  collide(ball){
    return Math.hypot(this.x - ball.x, this.y - ball.y)<= this.radius + ball.radius;
  }

  activate(){
    console.log('BonusTemplate activate function');
  }
}
