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

module.exports = {
  range,
  normalize,
  norm,
};
