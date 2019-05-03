const PIXI = require('pixi.js');
const Paddle = require('./components/Paddle');
const Field = require('./components/Field');
const Ball = require('./components/Ball');
const io = require('socket.io-client/dist/socket.io');

const app = new PIXI.Application({
  antialias: true,
  width: 1440,
  height: 1080
});
document.body.appendChild(app.view);


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
    let cvHeight = document.querySelector('canvas').clientHeight;
    player.y = e.layerY*1080/cvHeight;
    socket.emit('playerMove', {y: player.y});
  });

  let field = new Field(app, [player1, player2], ballData, {
    h: app.screen.height,
    w: app.screen.width
  });

  socket.on('ballSync', field.setBalls.bind(field));
  socket.on('playerScored', (ballScore) => {
    field.setBalls.bind(field)(ballScore.balls);
    field.score = ballScore.score;
    field.updateScore();
  });
  socket.on('bonusSpawned', field.spawnBonus.bind(field));
  socket.on('bonusCollected', (bonusesPaddles) => {
    field.setBonuses(bonusesPaddles.bonuses);
  });
}

function setBall(newBall){
  field.ball.x = newBall.x;
  field.ball.y = newBall.y;
  field.ball.velocity = newBall.velocity;
}

window.addEventListener('keydown', (e) => {
  if(e.key == ' '){
    if(document.fullscreen)
      document.exitFullscreen();
    else
      document.body.requestFullscreen();
  }
})
