const PIXI = require('pixi.js');
const BasePaddle = require('../../common/BasePaddle');

module.exports = class Paddle extends BasePaddle {
  constructor(options){
    super(options);
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
    this.graphics.endFill();
    Object.assign(this, options);
  }

  set x(value){
    this._x = value;
    if(this.graphics){
      this.graphics.x = value;
    }
  }

  set y(value){
    this._y = value;
    if(this.graphics){
      this.graphics.y = value;
    }
  }

  get x(){
    return this._x;
  }

  get y(){
    return this._y;
  }
};
