module.exports  =  class Paddle {
  constructor(options){
    const defaults = {
      x:0,
      y:0,
      w: 20,
      h: 100,
      color: 0xFFFFFF,
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);
  }

  collide(ball){
    var distX = Math.abs(ball.x - this.x)-this.w/2-ball.radius;
    var distY = Math.abs(ball.y - this.y)-this.h/2-ball.radius;;

    if (distX > 0) { return false; }
    if (distY > 0) { return false; }

    if (distX <= 0) { return true; }
    if (distY <= 0) { return true; }

    var dx=distX-this.w/2;
    var dy=distY-this.h/2;
    return (dx*dx+dy*dy<=(ball.r*ball.r));
    // return ((ball.x - ball.radius < this.x) || (ball.x + ball.radius >this.x));
  }
}
