const BonusTemplate = require('../BonusTemplate');
const Ball = require('../BaseBall');

module.exports = class BaseDoubleBall extends BonusTemplate {
  constructor(x, y){
    super();
    this.x = x;
    this.y = y;
    this.type = 'DoubleBall';
  }

  activate(field){
    field.balls.push(new Ball(field.w/2, field.h/2));
  }
}
