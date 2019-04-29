module.exports  =  class BaseBall {
  constructor(x, y, options){
    let theta = (Math.random()-0.5)*2*Math.PI/3;
    let speed = 6*(Math.round(Math.random()) * 2 - 1);
    const defaults = {
      velocity:{
        x: speed*Math.cos(theta),
        y: speed*Math.sin(theta)
      },
      radius: 12,
      color: 0xFF0000
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);
    this.x = x;
    this.y = y;
  }

  move(dt){
    this.x += this.velocity.x*dt;
    this.y += this.velocity.y*dt;
  }

  reset(x, y){
    this.x = x;
    this.y = y;
    let theta = (Math.random()-0.5)*2*Math.PI/3;
    let speed = 6*(Math.round(Math.random())*2 - 1);
    this.velocity.x = speed*Math.cos(theta);
    this.velocity.y = speed*Math.sin(theta);
  }

}
