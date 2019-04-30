const BonusTemplate = require('../BonusTemplate');

module.exports = class BaseDoubleBall extends BonusTemplate {
  constructor(x, y){
    super(x, y);

  }
  activate(field){
    field.balls.push(new Ball(this.w/2, this.h/2));
  }
}
