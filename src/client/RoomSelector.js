const io = require('socket.io-client/dist/socket.io');
const Game = require('./Game.js');

// params: element = the DOM node to inject the room selector into
module.exports = class RoomSelector {
  constructor(element){
    this.root = element;
    this.buttons = element.querySelector('.room-buttons');
    this.shareDiv = element.querySelector('.room-share');
    this.copyText = this.shareDiv.querySelector('.copy-text');
    this.shareButton = this.shareDiv.querySelector('button');
    this.gameRoot = document.querySelector('.game-container');
    this.view = 'room-selector';

    let joinButton = this.buttons.querySelector('.join-room');
    let createButton = this.buttons.querySelector('.create-room');
    createButton.addEventListener('click', this.createRoom.bind(this));
    joinButton.addEventListener('click', this.joinPrompt.bind(this));

    this.connect();
    this.socket.on('disconnect', this.connect.bind(this));
  }

  tryToJoin(roomId){
    this.socket.emit('joinRoom', roomId);

    this.socket.on('noSuchRoom', () => {
      console.log('Room doesn\'t exist');
    });

    this.socket.on('roomFull', () => {
      console.log('Room is full');
    });

    this.socket.on('joinedRoom', () => {
      console.log('Successfully joined room '+roomId);
    })
  }

  createRoom(){
    this.socket.emit('createRoom');
    this.socket.on('roomCreated', (id) => {
      console.log('Successfully created room');
      this.shareRoom.bind(this)(id);
    })
  }

  switchView(){
    if(this.view == 'room-selector'){
      show(this.gameRoot);
      hide(this.root);
      hide(this.copyText);
      show(this.buttons);
      hide(this.shareDiv);
      this.view = 'game-container';
    } else {
      show(this.root)
      hide(this.gameRoot);
      this.view = 'room-selector';
    }
  }

  shareRoom(id){
    hide(this.buttons);
    show(this.shareDiv);
    let url = new URL(window.location);
    url.hash = '#'+id;
    this.shareButton.addEventListener('click', () => {
      copyToClipboard(url.href);
      show(this.copyText);
    });
  }

  joinPrompt(){
    console.log('Join dialog.');
  }

  connect(){
    this.socket = io.connect();

    // Detect roomId in url for quick join
    let roomId = new URL(window.location).hash.slice(1);
    if(roomId) {
      this.tryToJoin(roomId);
    }

    this.socket.on('gameStarted', data => {
      this.game = new Game(data.controlledPlayer, data.initialBall, this.socket);
      this.switchView();
    });

    this.socket.on('roomClosed', () => {
      console.log('Room closed, back to room selector');
      this.switchView();
      this.game.destroy;
      this.game = null;
      this.gameRoot.innerHTML = '';
    });
  }
}

function copyToClipboard(str){
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function hide(element){
  element.classList.add('hidden');
}

function show(element){
  element.classList.remove('hidden');
}
