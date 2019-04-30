
module.exports = class BonusTemplate{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.radius = 30;
  }
  collide(ball){
    return Math.hypot(this.x - ball.x, this.y - ball.y)<= this.radius + ball.radius;
  }
  activate(){
    console.log('BonusTemplate activate function');
  }
}
