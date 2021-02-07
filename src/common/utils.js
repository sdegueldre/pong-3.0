const range = (start, stop, step = 1) => {
  if(stop === undefined){
    stop = start;
    start = 0;
  }
  const ret = [];
  for(let i = start; Math.sign(stop - i) === Math.sign(step); i += step){
    ret.push(i);
  }
  return ret;
};

const norm = ({x, y}) => Math.sqrt(x ** 2 + y ** 2);

const normalize = ({x, y}) => {
  const length = norm({x, y});
  return {x: x / length, y: y / length};
};

const sub = ({x: x1, y: y1}, {x: x2, y: y2}) => ({x: x1 - x2, y: y1 - y2});
const mult = (scalar, {x, y}) => ({x: scalar * x, y: scalar * y});

module.exports = {
  range,
  normalize,
  norm,
  sub,
  mult,
};
