import * as PIXI from 'pixi.js';
import Paddle from './components/Paddle';

import Field from './components/Field';
import Ball from './components/Ball';

const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

window.addEventListener('keydown', console.log);

// app.stage.addChild(graphics);
let field = new Field({
  h: app.screen.height,
  w: app.screen.width
});
app.stage.addChild(field);

let player1 = new Paddle({
  x: 30,
  y: app.screen.height/2
});
player1.interactive = true;
player1.on('mousemove', (e) => {
  player1.y = e.data.global.y;
});
let player2 = new Paddle({
  x: app.screen.width-30,
  y: app.screen.height/2
});
player2.interactive = true;
player2.on('mousemove', (e) => {
  player2.y = e.data.global.y;
});
app.stage.addChild(player1, player2);

let ball = new Ball({
  ticker: app.ticker,
  field:field,
  x:300,
  y:150,
  paddles:[player1,player2],
});
app.stage.addChild(ball);
