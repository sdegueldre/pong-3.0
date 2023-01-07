export type TickerCb = (delta: number) => unknown;
export class Ticker {
  callbacks = new Set<TickerCb>();
  lastTs = performance.now();
  constructor() {
    this.tick = this.tick.bind(this);
    window.requestAnimationFrame(this.tick);
  }
  tick(ts: number) {
    const delta = (ts - this.lastTs) / 16.667;
    for(const cb of [...this.callbacks].reverse()) {
      cb(delta);
    }
    this.lastTs = ts;
    window.requestAnimationFrame(this.tick);
  }
  add(cb: TickerCb) {
    this.callbacks.add(cb);
  }
  remove(cb: TickerCb) {
    this.callbacks.delete(cb);
  }
  addOnce(cb: TickerCb) {
    const wrapped = (dt: number) => {
      cb(dt);
      this.remove(wrapped);
    };
    this.add(wrapped);
  }
}
