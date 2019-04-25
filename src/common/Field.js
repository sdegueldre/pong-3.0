const PIXI = require('pixi.js');

module.exports  =  class Field extends PIXI.Graphics {
  constructor(options){
    super();
    const defaults = {
      h: 600,
      w: 800,
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);

    for (let i=0; i*50<this.h ;i++){
      this.beginFill(0xFFFFFF);
    	this.drawRect(this.w/2 -2.5, 50*i+10, 5, 30);
      this.endFill();
    }
    this.logged = false;
  }
  collide(ball){
    return ((ball.y - ball.radius < 0) || (ball.y + ball.radius >this.h));
  }
  out(ball){
    return ((ball.x - ball.radius < 0) || (ball.x + ball.radius >this.w));
  }
}
