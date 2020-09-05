module.exports = class BasePaddle {
  constructor(options){
    const defaults = {
      x: 0,
      y: 0,
      w: 30,
      h: 150,
      color: 0xFFFFFF,
      bonuses: [],
    };
    Object.assign(defaults, options);
    Object.assign(this, defaults);
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
