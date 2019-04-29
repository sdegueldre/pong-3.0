module.exports  =  class BaseField {
  constructor(options){
    const defaults = {
      h: 600,
      w: 800,
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);
  }

  collide(ball){
    return ((ball.y - ball.radius < 0) || (ball.y + ball.radius >this.h));
  }

  out(ball){
    return ((ball.x - ball.radius < 0) || (ball.x + ball.radius >this.w));
  }
}
