import * as PIXI from 'pixi.js';
import { BasePaddle } from '../../../common/game/objects';

export default class Paddle extends BasePaddle {
  graphics: PIXI.Graphics;
  name: string;
  _x!: number;
  _y!: number;
  constructor(options: Vec2 & { name: string }){
    super(options);
    this.name = options.name;
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
    this.graphics.endFill();
    Object.assign(this, options);
  }

  // @ts-ignore ts doesn't allow overriding properties with accessors
  // Making this an accessor on BaseBall makes it non enumerable with a host
  // of complications.
  get x(){
    return this._x;
  }

  set x(value){
    this._x = value;
    if(this.graphics){
      this.graphics.x = value;
    }
  }
  // @ts-ignore ts doesn't allow overriding properties with accessors see get x
  get y(){
    return this._y;
  }

  set y(value){
    this._y = value;
    if(this.graphics){
      this.graphics.y = value;
    }
  }
}
