const PIXI = require('pixi.js');
const {range} = require('../../common/utils.js');

const GRAVITY = 500; // px/s²

class Particle {
  constructor({x = 0, y = 0} = {}){
    this.pos = {x, y};
    this.vel = {x: (Math.random() - 0.5) * 25, y: (Math.random() - 0.75) * 25};
  }

  update(dt){
    this.vel.y += GRAVITY * dt / 1000;
    Object.keys(this.pos).forEach(key => {
      this.pos[key] += this.vel[key];
    });
  }
}

module.exports.CollisionParticles = class CollisionParticles {
  constructor({x, y, app, birth = Date.now(), lifetime = 500}){
    this.graphics = new PIXI.Graphics();
    this.graphics.x = x;
    this.graphics.y = y;
    this.birth = birth;
    this.lifetime = lifetime;
    this.update = this.update.bind(this);
    this.app = app;
    app.ticker.add(this.update);
    app.stage.addChild(this.graphics);
    this.particles = range(20).map(() => new Particle());
    this.alive = true;
  }

  update(dt){
    const {graphics, birth, lifetime, particles, app} = this;
    const timeLeft = birth + lifetime - Date.now();
    if(timeLeft < 0){
        this.alive = false;
        graphics.destroy();
        return app.ticker.remove(this.update);
    }
    graphics.clear();
    const opacity = 1 - (1 - timeLeft / lifetime) ** 3;
    graphics.beginFill(0xFFFFFF, opacity);
    particles.forEach(particle => {
      particle.update(dt);
      graphics.drawRect(particle.pos.x, particle.pos.y, 5, 5);
    });
  }
};
