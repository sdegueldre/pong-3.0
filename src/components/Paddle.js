import * as PIXI from 'pixi.js';

export default class Paddle extends PIXI.Graphics {
  constructor(options){
    super();
    const defaults = {
      x:0,
      y:0,
      w: 20,
      h: 100,
      color: 0xFFFFFF
    }
    Object.assign(defaults, options);
    for(let key in defaults){
      this[key] = defaults[key];
    }
    console.log(defaults, options);

    this.beginFill(this.color);
    this.drawRect(-this.w/2, -this.h/2, this.w, this.h);
    this.endFill();
  }
}
