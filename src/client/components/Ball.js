const PIXI = require('pixi.js');
const BaseBall = require('../../common/BaseBall');

module.exports = class Ball extends BaseBall {
  constructor(x, y, options){
    super(x, y, options);
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(this.color);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }

  removeBall(){
    console.log("Not gonna remove ball until server says so.");
  }

  set x(value){
    this._x = value;
    if(this.graphics)
      this.graphics.x = value;
  }

  set y(value){
    this._y = value;
    if(this.graphics)
      this.graphics.y = value;
  }

  get x(){
    return this._x;
  }

  get y(){
    return this._y;
  }
}
