import { Ticker } from "./Ticker";
import { DisplayObject } from "./DisplayObject";

type AppOptions = {
  antialias: boolean;
  width: number;
  height: number;
};
export class Application {
  antialias: boolean;
  width: number;
  height: number;
  view = document.createElement("canvas");
  ctx = this.view.getContext("2d")!;
  screen: { width: number; height: number; };
  ticker = new Ticker();
  stage = new DisplayObject();
  constructor({ antialias, width, height }: AppOptions) {
    this.antialias = antialias;
    this.width = width;
    this.height = height;
    this.view.width = width;
    this.view.height = height;
    this.screen = { width, height };
    this.render = this.render.bind(this);
    this.ticker.add(this.render);
  }
  render() {
    this.ctx.clearRect(0, 0, this.view.width, this.view.height);
    this.stage.render(this.ctx);
  }
  destroy() {
    this.stage.destroy();
    this.ticker.remove(this.render);
    this.view.remove();
  }
}
