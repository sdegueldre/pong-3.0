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
    for( let ball of this.balls){
      if((this.ball.y - this.ball.radius < 0) && (this.ball.velocity.y < 0)){
        return this.ball.velocity.y *= -1;
      } else if((this.ball.y + this.ball.radius >this.h) && (this.ball.velocity.y > 0)){
        return this.ball.velocity.y *= -1;
      }
    }
  }

  collidePaddle(){
    for( let ball of this.balls){
      for(let player of this.players){
        if(player.collide(this.ball)){
          if((player == this.players[0] && this.ball.velocity.x < 0) || (player == this.players[1] && this.ball.velocity.x > 0)){
            let theta = Math.PI*(player.y-this.ball.y)/(4*player.h/2);
            let speed = 1.05*Math.hypot(this.ball.velocity.x, this.ball.velocity.y);
            this.ball.velocity.y = -speed*Math.sin(theta);

            if(this.ball.velocity.x>0)
              this.ball.velocity.x = -speed*Math.cos(theta);
            else
              this.ball.velocity.x = speed*Math.cos(theta);
          }
        }
      }
    }
  }

  outOfField(){
    for( let ball of this.balls){
      if (this.ball.x - this.ball.radius < 0){
        this.score.player2 += 1;
        this.ball.reset(this.w/2, this.h/2);
        this.emit('outOfField');
      } else if (this.ball.x + this.ball.radius >this.w){
        this.score.player1 += 1;
        this.ball.reset(this.w/2, this.h/2);
        this.emit('outOfField');
      }
    }
  }

  update(dt){
    for( let ball of this.balls){
      this.ball.move(dt);
      this.collideWall();
      this.collidePaddle();
      this.outOfField();
    }
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
