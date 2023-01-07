import { DisplayObject } from "./DisplayObject";
import { toRgb } from "./utils";

type TextSettings = {
  fontSize: number;
  fill: number;
  strokeThickness: number;
}
export class Text extends DisplayObject {
  text: string;
  settings: TextSettings;
  x = 0;
  y = 0;
  textAlign: "left" | "right" | "center" = "center";
  textBaseline: "top" | "middle" | "bottom" = "middle";
  constructor(text: string, settings: TextSettings) {
    super();
    this.text = text;
    this.settings = settings;
  }
  get width() {
    return 200; //FIXME implement
  }
  get height() {
    return this.settings.fontSize + this.settings.strokeThickness;
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = toRgb(this.settings.fill);
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.settings.strokeThickness;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.font = `${this.settings.fontSize}px sans-serif`;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
    super.render(ctx);
  }
}
