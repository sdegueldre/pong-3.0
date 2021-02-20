const BonusTemplate = require('../BonusTemplate');
const Ball = require('../BaseBall');

module.exports = class BaseDoubleBall extends BonusTemplate {
  constructor(x, y){
    super();
    this.x = x;
    this.y = y;
    this.type = 'DoubleBall';
  }

  collect(ball, field){
    if(ball.velocity.x > 0){
      field.players[0].bonuses.push(this);
    } else {
      field.players[1].bonuses.push(this);
    }
  }

  activate(ball, field){
    const velocity = ball.velocity;
    const speed = Math.hypot(velocity.x, velocity.y);
    const angle = Math.atan2(velocity.y, velocity.x);
    const a1 = angle + Math.PI / 18;
    const a2 = angle - Math.PI / 18;
    field.removeBall(ball);
    field.addBall(new Ball(
      ball.x,
      ball.y,
      {velocity: {
        x: speed * Math.cos(a1),
        y: speed * Math.sin(a1),
      },
    }));
    field.addBall(new Ball(
      ball.x,
      ball.y,
      {velocity: {
        x: speed * Math.cos(a2),
        y: speed * Math.sin(a2),
      },
    }));
  }
};
