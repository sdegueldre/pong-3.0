import ReactDOM from 'react-dom';
import React, {useState, useEffect, useRef} from 'react';
import {RoomSelector, NameSelector, GameContainer} from '/components';
import ioClient from 'socket.io-client/dist/socket.io';
import Game from '/game';

const App = () => {
  const [game, setGame] = useState(null);
  const gameObj = useRef({game, setGame});
  const [socket, setSocket] = useState(null);
  const [joinRoom, setJoinRoom] = useState(() => null);
  const [userName, setUserName] = useState('');
  const [spectators, setSpectators] = useState([])

  gameObj.current.game = game;
  gameObj.current.setGame = setGame;
  useEffect(() => {
    const socket = ioClient.connect();
    const joinRoom = async (roomId) => {
      socket.emit('joinRoom', roomId);
    };

    socket.on('joinedRoom', () => {
      const startGame = ({controlledPlayer, initialBall, players, spectators}) => {
        if(spectators){
          setSpectators(spectators);
        }
        gameObj.current.setGame(new Game(controlledPlayer, initialBall, socket, players));
      };
      socket.once('gameStarted', startGame);
      socket.once('roomClosed', () => {
        socket.off('gameStarted', startGame);
        if(gameObj.current.game){
          gameObj.current.game.destroy();
          gameObj.current.setGame(null);
        }
      });
    });

    socket.on("updateSpectators", spectators => {
      if(spectators){
        setSpectators(spectators);
      }
    });

    socket.on("updateUserName", userName => {
      setUserName(userName);
    });

    setSocket(socket);
    setJoinRoom(() => joinRoom);
  }, []);

  const chooseUserName = userName => {
    if(userName){
      setUserName(userName);
    } else {
      setUserName("Player");
    }
    socket.emit('setUserName', userName);
    const roomId = new URL(window.location).hash.slice(1);
    if(roomId){
      joinRoom(roomId);
    }
  };

  return !socket ? null :
    game ? <GameContainer game={game} spectators={spectators}/> :
    userName ? <RoomSelector socket={socket} joinRoom={joinRoom} /> :
    <NameSelector chooseUserName={chooseUserName} />;
};

ReactDOM.render(<App/>, document.getElementById('app'));

window.addEventListener("orientationchange", (event) => {
  const angle = Math.abs(event.target.screen.orientation.angle);
  if(angle === 90 || angle === 270) {
    document.body.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
