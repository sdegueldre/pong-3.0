import * as PIXI from 'pixi.js';
import { range } from '../../../common/utils';

const GRAVITY = 500; // px/s²

class Particle {
  pos: Vec2;
  vel: Vec2;
  constructor({ x = 0, y = 0 } = {}){
    this.pos = { x, y };
    this.vel = { x: (Math.random() - 0.5) * 25, y: (Math.random() - 0.75) * 25 };
  }

  update(dt: number){
    this.vel.y += GRAVITY * dt / 1000;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
}

type ParticleInit = Vec2 & {
  ticker: PIXI.ticker.Ticker;
  parent: PIXI.Graphics;
  birth?: number;
  lifetime?: number;
}
export default class CollisionParticles {
  graphics: PIXI.Graphics;
  ticker: PIXI.ticker.Ticker;
  birth: number;
  lifetime: number;
  particles: Particle[];
  alive: boolean;
  constructor({ x, y, ticker, parent, birth = Date.now(), lifetime = 500 }: ParticleInit){
    this.graphics = new PIXI.Graphics();
    this.graphics.x = x;
    this.graphics.y = y;
    this.birth = birth;
    this.lifetime = lifetime;
    this.update = this.update.bind(this);
    this.ticker = ticker;
    ticker.add(this.update);
    parent.addChild(this.graphics);
    this.particles = range(20).map(() => new Particle());
    this.alive = true;
  }

  update(dt: number){
    const { graphics, birth, lifetime, particles, ticker } = this;
    const timeLeft = birth + lifetime - Date.now();
    if(timeLeft < 0){
      this.alive = false;
      graphics.destroy();
      return ticker.remove(this.update);
    }
    graphics.clear();
    const opacity = 1 - (1 - timeLeft / lifetime) ** 3;
    graphics.beginFill(0xFFFFFF, opacity);
    particles.forEach(particle => {
      particle.update(dt);
      graphics.drawRect(particle.pos.x, particle.pos.y, 5, 5);
    });
  }
}
