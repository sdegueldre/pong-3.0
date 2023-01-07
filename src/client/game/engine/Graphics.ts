import { DisplayObject } from "./DisplayObject";
import { toRgb } from "./utils";

export class Graphics extends DisplayObject {
  x = 0;
  y = 0;
  // Bounding box
  minX = Number.POSITIVE_INFINITY;
  maxX = Number.NEGATIVE_INFINITY;
  minY = Number.POSITIVE_INFINITY;
  maxY = Number.NEGATIVE_INFINITY;
  maxStrokeWidth = 0;
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;
  none = this.ctx.createLinearGradient(0, 0, 0, 0); // sentinel value
  isDirty = true;
  commands: (() => void)[] = [];
  constructor() {
    super();
    this.ctx.strokeStyle = this.none;
  }
  beginFill(color: number, opacity?: number) {
    this.commands.push(() => {
      this.ctx.fillStyle = toRgb(color, opacity);
    });
  }
  endFill() {
    this.commands.push(() => {
      this.ctx.fillStyle = this.none;
    });
  }
  lineStyle(width: number, color: number, opacity?: number) {
    this.maxStrokeWidth = Math.max(this.maxStrokeWidth, width);
    this.commands.push(() => {
      if(width !== 0) {
        this.ctx.lineWidth = width;
        this.ctx.strokeStyle = toRgb(color, opacity);
      } else {
        this.ctx.strokeStyle = this.none;
      }
    });
  }
  drawRect(x: number, y: number, w: number, h: number) {
    this.adjustBoundingBox(x, y, w, h);
    this.commands.push(() => {
      if(this.ctx.fillStyle !== this.none) {
        this.ctx.fillRect(x, y, w, h);
      }
      if(this.ctx.strokeStyle !== this.none) {
        this.ctx.strokeRect(x, y, w, h);
      }
    });
  }
  drawCircle(x: number, y: number, radius: number) {
    this.adjustBoundingBox(x - radius, y - radius, 2 * radius, 2 * radius);
    this.commands.push(() => {
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
      if(this.ctx.fillStyle !== this.none) {
        this.ctx.fill();
      }
      if(this.ctx.strokeStyle !== this.none) {
        this.ctx.stroke();
      }
    });
  }
  render(ctx: CanvasRenderingContext2D) {
    const halfWidth = this.maxStrokeWidth / 2;
    if(this.isDirty) {
      this.canvas.width = this.maxX - this.minX + this.maxStrokeWidth;
      this.canvas.height = this.maxY - this.minY + this.maxStrokeWidth;
      this.ctx.translate(-this.minX + halfWidth, -this.minY + halfWidth);
      this.ctx.strokeStyle = this.none;
      for(const command of this.commands) {
        command();
      }
      this.isDirty = false;
    }
    ctx.drawImage(this.canvas, this.x + this.minX - halfWidth, this.y + this.minY - halfWidth);
    super.render(ctx);
  }
  adjustBoundingBox(x: number, y: number, w: number, h: number) {
    this.isDirty = true;
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x + w);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y + h);
  }
  clear() {
    this.commands = [];
    this.minX = Number.POSITIVE_INFINITY;
    this.maxX = Number.NEGATIVE_INFINITY;
    this.minY = Number.POSITIVE_INFINITY;
    this.maxY = Number.NEGATIVE_INFINITY;
    this.maxStrokeWidth = 0;
    this.isDirty = true;
  }
}
