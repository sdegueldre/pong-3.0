const Ball = require ('../common/BaseBall');

module.exports  =  class BaseField {
  constructor(players, options){
    this.listeners = [];
    const defaults = {
      h: 600,
      w: 800,
    }
    Object.assign(defaults, options);
    Object.assign(this, defaults);
    this.players = players;
    this.balls = [new Ball(this.w/2, this.h/2)];
    this.score = {player1: 0, player2: 0}
  }

  collideWall(){
    for(let ball of this.balls){
      if((ball.y - ball.radius < 0) && (ball.velocity.y < 0)){
        return ball.velocity.y *= -1;
      } else if((ball.y + ball.radius >this.h) && (ball.velocity.y > 0)){
        return ball.velocity.y *= -1;
      }
    }
  }

  collidePaddle(){
    for(let ball of this.balls){
      for(let player of this.players){
        if(player.collide(ball)){
          if((player == this.players[0] && ball.velocity.x < 0) || (player == this.players[1] && ball.velocity.x > 0)){
            let theta = Math.PI*(player.y-ball.y)/(4*player.h/2);
            let speed = 1.05*Math.hypot(ball.velocity.x, ball.velocity.y);
            ball.velocity.y = -speed*Math.sin(theta);

            if(ball.velocity.x>0)
              ball.velocity.x = -speed*Math.cos(theta);
            else
              ball.velocity.x = speed*Math.cos(theta);
          }
        }
      }
    }
  }

  outOfField(){
    for(let ball of this.balls){
      if(ball.x - ball.radius < 0 || ball.x + ball.radius > this.w){
        if(ball.x - ball.radius < 0)
          this.score.player2 += 1;
        else
          this.score.player1 += 1;
        this.emit('outOfField');
        this.balls.splice(this.balls.indexOf(ball), 1);
      }
    }
    if(this.balls.length <= 0){
      this.balls.push(new Ball(this.w/2, this.h/2));
      this.balls.push(new Ball(this.w/2, this.h/2));
    }
  }

  update(dt){
    for(let ball of this.balls){
      ball.move(dt);
    }
    this.collideWall();
    this.collidePaddle();
    this.outOfField();
  }

  on(type, callback){
    this.listeners.push({type: type, callback: callback});
  }

  emit(type, data){
    this.listeners
      .filter(listener => listener.type == type)
      .forEach(listener => listener.callback(data));
  }
}
