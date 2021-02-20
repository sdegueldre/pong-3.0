module.exports = class BaseBall {
  constructor(x, y, options){
    const theta = (Math.random() - 0.5) * 2 * Math.PI / 3;
    const speed = 10 * (Math.round(Math.random()) * 2 - 1);
    const defaults = {
      velocity: {
        x: speed * Math.cos(theta),
        y: speed * Math.sin(theta),
      },
      radius: 18,
      color: 0x00FFFF,
    };
    Object.assign(defaults, options);
    Object.assign(this, defaults);
    this.x = x;
    this.y = y;
  }

  move(dt){
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }

  reset(x, y){
    this.x = x;
    this.y = y;
    const theta = (Math.random() - 0.5) * 2 * Math.PI / 3;
    const speed = 6 * (Math.round(Math.random()) * 2 - 1);
    this.velocity.x = speed * Math.cos(theta);
    this.velocity.y = speed * Math.sin(theta);
  }
};
