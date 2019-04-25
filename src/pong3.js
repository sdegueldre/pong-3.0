import * as PIXI from 'pixi.js';
import Paddle from './components/Paddle';
import Field from './components/Field';
import Ball from './components/Ball';
import io from 'socket.io-client/dist/socket.io';

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
let player2 = new Paddle({
  x: app.screen.width-30,
  y: app.screen.height/2
});
player2.interactive = true;
app.stage.addChild(player1, player2);

let ball = new Ball({
  ticker: app.ticker,
  field:field,
  x:300,
  y:150,
  paddles:[player1,player2],
});
app.stage.addChild(ball);

const socket = io.connect('http://localhost:3000');
const location = new URL(window.location);
console.log(location);
if(location.hash == ''){
  socket.emit('createRoom');

  socket.on('roomCreated', (id) => {
    console.log('Successfully created room with id '+id);
  })

  socket.on('gameStarted', () => control(player1));
} else {
  const roomId = location.hash.slice(1);
  socket.emit('joinRoom', roomId);

  socket.on('joinedRoom', () => {
    console.log('Successfully joined room '+roomId);
  })
  socket.on('gameStarted', () => control(player2));
}

socket.on('playerMove', (data) => {
  switch(data.playerNumber){
    case 1:
      player1.y = data.y;
      break;
    case 2:
      player2.y = data.y;
      break;
  }
})

function control(player){
  console.log('Game started');
  player.on('mousemove', (e) => {
    player.y = e.data.global.y;
    socket.emit('playerMove', {y: player.y});
  });
}
