import * as PIXI from 'pixi.js';
import Paddle from './components/Paddle';



const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
console.log(app.view);
// document.addEventListener('click', () => app.view.requestFullscreen());

// Rectangle
// graphics.beginFill(0xFFFFFF);
// graphics.drawRect(20 , ((app.screen.height)/2)-50, 20, 100);
// graphics.endFill();
// Rectangle2
graphics.beginFill(0xFFFFFF);
graphics.drawRect(app.screen.width-40, app.screen.height/2 -50, 20, 100);
graphics.endFill();

//Filet
for (let i=0; i*50<app.screen.height ;i++){
  graphics.beginFill(0xFFFFFF);
	graphics.drawRect(app.screen.width/2 -2.5, 50*i+10, 5, 30);
  graphics.endFill();
}

// Ball
graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
graphics.beginFill(0xF91818, 1);
graphics.drawCircle(250, 250, 10);
graphics.endFill();
graphics.interactive = true;

graphics.on('mousemove', (e) => {
  graphics.x += e.data.originalEvent.movementX;
  graphics.y += e.data.originalEvent.movementY;
});

window.addEventListener('keydown', console.log);

// app.stage.addChild(graphics);
let player1 = new Paddle({x: 30, y: app.screen.height/2});
let player2 = new Paddle({x: app.screen.width-30, y: app.screen.height/2});
console.log(player1);
app.stage.addChild(player1, player2);
