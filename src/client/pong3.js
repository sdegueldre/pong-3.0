const PIXI = require('pixi.js');
const Paddle = require('./components/Paddle');
const Field = require('./components/Field');
const Ball = require('./components/Ball');
const io = require('socket.io-client/dist/socket.io');

const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

// app.stage.addChild(graphics);
let field = new Field({
  h: app.screen.height,
  w: app.screen.width
});
app.stage.addChild(field.graphics);

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
app.stage.addChild(player1.graphics, player2.graphics);


const socket = io.connect();
const location = new URL(window.location);
if(location.hash == ''){
  socket.emit('createRoom');

  socket.on('roomCreated', (id) => {
    console.log('Successfully created room, join here:');
    let url = new URL(window.location);
    url.hash = '#'+id;
    console.log(url.href);
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

socket.on('roomClosed', () => {
  console.log('Room closed, reloading');
  window.location.reload();
});

socket.on('playerMove', (data) => {
  switch(data.playerNumber){
    case 1:
      player1.y = data.y;
      break;
    case 2:
      player2.y = data.y;
      break;
  }
});

function gameInit(player, ballData){
  console.log('Game started');
  window.addEventListener('mousemove', (e) => {
    player.y = e.layerY;
    socket.emit('playerMove', {y: player.y});
  });

  let ball = new Ball(field, {
    ticker: app.ticker,
    x:ballData.x,
    y:ballData.y,
    velocity: ballData.velocity,
    paddles:[player1,player2],
  });
  socket.on('ballSync', (newBall) => {
    ball.x = newBall.x;
    ball.y = newBall.y;
    ball.velocity = newBall.velocity;
  })
  app.stage.addChild(ball.graphics);
}
