module.exports = {
  range: (start, stop, step = 1) => {
    if(stop === undefined){
      stop = start;
      start = 0;
    }
    const ret = [];
    for(let i = start; Math.sign(stop - i) === Math.sign(step); i += step){
      ret.push(i);
    }
    return ret;
  },
};
