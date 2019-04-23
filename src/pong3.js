import * as PIXI from 'pixi.js';



const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();

// Rectangle
graphics.beginFill(0xFFFFFF);
graphics.drawRect(20 , ((app.screen.height)/2)-50, 20, 100);
graphics.endFill();
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




app.stage.addChild(graphics);
