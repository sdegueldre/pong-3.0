export function toRgb(color: number, opacity = 1) {
  return `rgb(${color & 0xFF0000} ${color & 0x00FF00} ${color & 0x0000FF} / ${opacity})`;
}
