const Ball = require ('../common/BaseBall');
const Paddle = require ('../common/BasePaddle');
const BaseDoubleBall = require('./bonuses/BaseDoubleBall');

module.exports = class BaseField {
  constructor(options){
    this.listeners = [];
    const defaults = {
      h: 1080,
      w: 1440,
    };
    Object.assign(defaults, options);
    Object.assign(this, defaults);
    this.players = [
      new Paddle({
        x: 30,
        y: this.h / 2,
      }),
      new Paddle({
        x: this.w - 30,
        y: this.h / 2,
      }),
    ];
    this.bonuses = [];
    this.addBonus();
    this.balls = [new Ball(this.w / 2, this.h / 2)];
    this.score = {player1: 0, player2: 0};
  }

  collideWall(){
    for(const ball of this.balls){
      if((ball.y - ball.radius < 0) && (ball.velocity.y < 0)){
        return ball.velocity.y *= -1;
      } else if((ball.y + ball.radius > this.h) && (ball.velocity.y > 0)){
        return ball.velocity.y *= -1;
      }
    }
  }

  collidePaddle(){
    for(const ball of this.balls){
      for(const player of this.players){
        if(player.collide(ball)){
          if((player === this.players[0] && ball.velocity.x < 0) ||
             (player === this.players[1] && ball.velocity.x > 0)){
            const theta = Math.PI * (player.y - ball.y) / (4 * player.h / 2);
            const speed = 1.05 * Math.hypot(ball.velocity.x, ball.velocity.y);
            ball.velocity.y = -speed * Math.sin(theta);

            if(ball.velocity.x > 0){
              ball.velocity.x = -speed * Math.cos(theta);
              this.players[1].activateBonuses(ball, this);
            } else {
              ball.velocity.x = speed * Math.cos(theta);
              this.players[0].activateBonuses(ball, this);
            }
          }
        }
      }
    }
  }

  outOfField(){
    for(const ball of this.balls){
      if(ball.x - ball.radius < 0 || ball.x + ball.radius > this.w){
        if(ball.x - ball.radius < 0){
          this.score.player2 += 1;
        } else {
          this.score.player1 += 1;
        }
        this.emit('outOfField');
        this.removeBall(ball);
      }
    }
    if(this.balls.length <= 0){
      this.balls.push(new Ball(this.w / 2, this.h / 2));
    }
  }

  collectBonuses(){
    for(const ball of this.balls){
      for(const bonus of this.bonuses){
        if(bonus.collide(ball)){
          this.removeBonus(bonus);
          bonus.collect(ball, this);
          this.emit('bonusCollected');
        }
      }
    }
  }

  update(dt){
    for(const ball of this.balls){
      ball.move(dt);
    }
    this.collideWall();
    this.collidePaddle();
    this.outOfField();
    this.collectBonuses();
  }

  on(type, callback){
    this.listeners.push({type: type, callback: callback});
  }

  emit(type, data){
    this.listeners
      .filter(listener => listener.type === type)
      .forEach(listener => listener.callback(data));
  }

  removeBall(ball){
    this.balls.splice(this.balls.indexOf(ball), 1);
  }

  addBall(ball){
    this.balls.push(ball);
  }

  removeBonus(bonus){
    this.bonuses.splice(this.bonuses.indexOf(bonus), 1);
  }

  addBonus(){
    this.bonuses.push(new BaseDoubleBall(this.w / 3 + Math.random() * this.w / 3, Math.random() * this.h));
  }
};
