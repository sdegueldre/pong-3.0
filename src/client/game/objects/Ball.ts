import * as PIXI from 'pixi.js';
import BaseBall from '../../../common/game/objects/BaseBall';

export type ClientBallOptions = { color?: number, radius?: number, velocity: Vec2 };

export default class Ball extends BaseBall {
  graphics: PIXI.Graphics;
  _x!: number;
  _y!: number;
  constructor(x: number, y: number, options: ClientBallOptions){
    super(x, y, options);
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(this.color);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }

  removeBall(){
    console.warn("Not gonna remove ball until server says so.");
  }

  addBall(){
    console.warn("Not adding ball on client");
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

  // @ts-ignore ts doesn't allow overriding properties with accessors, see get x
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
