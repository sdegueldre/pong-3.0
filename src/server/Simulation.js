const Ball = require ('../common/Ball')
const uuid = require('uuid/v1');

module.exports = class Simulation {

  constructor(field){
    this.field = field;
    const ball = new Ball({field: this.field});
  }

}
