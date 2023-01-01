module.exports = class BasePaddle {
  constructor(options){
    this.x = 0;
    this.y = 0;
    this.w = 30;
    this.h = 150;
    this.color = 0xFFFFFF;
    this.bonuses = [];
    Object.assign(this, options);
  }

  collide(ball){
    const distX = Math.abs(ball.x - this.x) - this.w / 2 - ball.radius;
    const distY = Math.abs(ball.y - this.y) - this.h / 2 - ball.radius;

    if(distX > 0 || distY > 0){
      return false;
    }

    if(distX <= 0 || distY <= 0){
      return true;
    }

    const dx = distX - this.w / 2;
    const dy = distY - this.h / 2;
    return (dx * dx + dy * dy <= (ball.r * ball.r));
  }

  activateBonuses(ball, field){
    const bonus = this.bonuses.shift();
    if(bonus){
      bonus.activate(ball, field);
    }
  }
};
