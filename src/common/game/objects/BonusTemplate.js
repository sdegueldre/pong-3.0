module.exports = class BonusTemplate {
  constructor(){
    this.radius = 50;
    this.player = null;
  }

  collide(ball){
    return Math.hypot(this.x - ball.x, this.y - ball.y) <= this.radius + ball.radius;
  }

  activate(){
    console.warn('Attempted to activate abstract BonusTemplate');
  }
};
