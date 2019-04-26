let PIXI
try {
  PIXI = require('pixi.js');
} catch(error){
  console.log(error);
}

module.exports  =  class Ball extends PIXI.Graphics {
  constructor(options){
    super();

    let theta= (Math.random()-0.5)*2*Math.PI/3;
    let speed= 6*(Math.round(Math.random()) * 2 - 1);
    this.field=options.field;

    const defaults = {
      x: this.field.w/2,
      y: this.field.h/2,
      velocity:{
        x: speed*Math.cos(theta),
        y: speed*Math.sin(theta)
      },
      radius: 12,
      color: 0xFF0000
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);
    if(PIXI){
      this.graphics = new PIXI.Graphics();
      this.graphics.beginFill(this.color);
      this.graphics.drawCircle(0, 0, this.radius);
      this.graphics.endFill();
      options.ticker.add(this.update.bind(this));
    }
  }

  update(dt, ticker){
    this.x += this.velocity.x*dt;
    this.y += this.velocity.y*dt;
    if (this.field.out(this)){
      this.reset();
    }
    if (this.field.collide(this)){
      this.velocity.y *= -1;
    }
    for (let paddle  of this.paddles){
      if (paddle.collide(this)){
        if ((paddle == this.paddles[0] && this.velocity.x<0) || (paddle == this.paddles[1] && this.velocity.x>0)){
          let theta = Math.PI*(paddle.y-this.y)/(3*paddle.h/2);
          let speed = 1.05*Math.hypot(this.velocity.x, this.velocity.y);
          this.velocity.y = -speed*Math.sin(theta);

          if (this.velocity.x>0)
            this.velocity.x = -speed*Math.cos(theta);
          else
            this.velocity.x = speed*Math.cos(theta);
        }
      }
    }
  }

  reset(){
    this.x =this.field.w/2;
    this.y = this.field.h/2;
    let theta = (Math.random()-0.5)*2*Math.PI/3;
    let speed = 6*(Math.round(Math.random()) * 2 - 1);
    this.velocity.x = speed*Math.cos(theta);
    this.velocity.y = speed*Math.sin(theta);
  }

  set x(value){
    this.x = value;
    this.graphics.x = value;
  }

  set y(value){
    this.y = value;
    this.graphics.y = value;
  }

}
