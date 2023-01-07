
export class DisplayObject {
  children = new Set<DisplayObject>();
  parent: DisplayObject | null = null;
  addChild(...children: DisplayObject[]) {
    for(const child of children) {
      child.parent = this;
      this.children.add(child);
    }
  }
  removeChild(...children: DisplayObject[]) {
    for(const child of children) {
      this.children.delete(child);
    }
  }
  destroy() {
    this.parent?.removeChild(this);
    for(const child of this.children) {
      child.destroy();
    }
  }
  render(ctx: CanvasRenderingContext2D) {
    for(const child of this.children) {
      child.render(ctx);
    }
  }
}
