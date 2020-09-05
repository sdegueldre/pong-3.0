const PIXI = require('pixi.js');
const BaseDoubleBall = require('../../../common/bonuses/BaseDoubleBall');

module.exports = class DoubleBall extends BaseDoubleBall {
  constructor(x, y){
    super(x, y);
    const g = new PIXI.Graphics();
    const unit = this.radius / 10;
    g.beginFill(0);
    g.lineStyle(3, 0xFFFFFF, 1, 0.5);
    g.drawCircle(0, 0, this.radius);
    g.endFill();
    g.beginFill(0X00FFFF);
    g.lineStyle(0, 0, 1, 1);
    g.drawCircle(-4 * unit, 0, 2.5 * unit);
    g.drawCircle(4 * unit, 0, 2.5 * unit);
    g.endFill();
    this.graphics = g;
    this.x = x;
    this.y = y;
  }

  set x(x){
    if(this.graphics){
        this.graphics.x = x;
    }
  }

  get x(){
    return this.graphics.x;
  }

  set y(y){
    if(this.graphics){
      this.graphics.y = y;
    }
  }

  get y(){
    return this.graphics.y;
  }
};
