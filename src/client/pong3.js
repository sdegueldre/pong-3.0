const PIXI = require('pixi.js');
const Paddle = require('../common/Paddle');
const Field = require('../common/Field');
const Ball = require('../common/Ball');
const io = require('socket.io-client/dist/socket.io');

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


const socket = io.connect('http://localhost:3000');
const location = new URL(window.location);
console.log(location);
if(location.hash == ''){
  socket.emit('createRoom');

  socket.on('roomCreated', (id) => {
    console.log('Successfully created room with id '+id);
  })

  socket.on('gameStarted', (ball) => gameInit(player1, ball));
} else {
  const roomId = location.hash.slice(1);
  socket.emit('joinRoom', roomId);

  socket.on('joinedRoom', () => {
    console.log('Successfully joined room '+roomId);
  })
  socket.on('gameStarted', (ball) => gameInit(player2, ball));
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

function gameInit(player, ballData){
  console.log('Game started');
  player.on('mousemove', (e) => {
    player.y = e.data.global.y;
    socket.emit('playerMove', {y: player.y});
  });

    let ball = new Ball({
      ticker: app.ticker,
      field:field,
      x:ballData.x,
      y:ballData.y,
      velocity: ballData.velocity,
      paddles:[player1,player2],
    });
    app.stage.addChild(ball);
}
