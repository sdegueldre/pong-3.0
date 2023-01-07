import { Graphics } from "../../engine/Graphics";
import { BaseDoubleBall } from '../../../../common/game/objects/bonuses';

export default class DoubleBall extends BaseDoubleBall {
  graphics: Graphics;
  constructor(x: number, y: number){
    super(x, y);
    const g = new Graphics();
    const unit = this.radius / 10;
    g.beginFill(0);
    g.lineStyle(3, 0xFFFFFF, 1);
    g.drawCircle(0, 0, this.radius);
    g.endFill();
    g.beginFill(0X00FFFF);
    g.lineStyle(0, 0, 1);
    g.drawCircle(-4 * unit, 0, 2.5 * unit);
    g.drawCircle(4 * unit, 0, 2.5 * unit);
    g.endFill();
    this.graphics = g;
    this.x = x;
    this.y = y;
  }
  // @ts-ignore ts doesn't allow overriding properties with accessors
  // Making this an accessor on BaseBall makes it non enumerable with a host
  // of complications.
  get x(){
    return this.graphics.x;
  }

  set x(x){
    if(this.graphics){
      this.graphics.x = x;
    }
  }

  // @ts-ignore ts doesn't allow overriding properties with accessors, see above
  get y(){
    return this.graphics.y;
  }

  set y(y){
    if(this.graphics){
      this.graphics.y = y;
    }
  }
}
