const PIXI = require('pixi.js');
const BaseField = require('../../common/BaseField');

module.exports = class Field extends BaseField {
  constructor(options){
    super(options);
    this.graphics = new PIXI.Graphics();
    for(let i = 0; i*50 < this.h; i++){
      this.graphics.beginFill(0xFFFFFF);
    	this.graphics.drawRect(this.w/2 - 2.5, 50*i + 10, 5, 30);
      this.graphics.endFill();
    }
  }
}
