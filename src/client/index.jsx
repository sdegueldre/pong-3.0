import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { RoomSelector, NameSelector, GameContainer } from './components';
import ioClient from 'socket.io-client/dist/socket.io';
import Game from './game';

const App = ({ socket }) => {
  const [game, setGame] = useState(null);
  const [userName, setUserName] = useState('');
  const [spectators, setSpectators] = useState([]);

  const joinRoom = async (roomId) => {
    socket.emit('joinRoom', roomId);
  };

  useEffect(() => {
    if(!game){
      socket.on('joinedRoom', () => {
        const startGame = ({ controlledPlayer, initialBall, players, spectators }) => {
          if(spectators){
            setSpectators(spectators);
          }
          setGame(new Game(controlledPlayer, initialBall, socket, players));
        };
        socket.once('gameStarted', startGame);
        socket.once('roomClosed', () => {
          socket.off('gameStarted', startGame);
          if(game){
            game.destroy();
            setGame(null);
          }
        });
      });
    }

    socket.on("updateSpectators", spectators => {
      if(spectators){
        setSpectators(spectators);
      }
    });
  }, [game]);

  useEffect(() => {
    socket.on("updateUserName", userName => {
      setUserName(userName);
    });
  }, []);

  const chooseUserName = userName => {
    if(userName){
      setUserName(userName);
    } else {
      setUserName("Player");
    }
    socket.emit('setUserName', userName);
    const roomId = new URL(window.location.href).hash.slice(1);
    if(roomId){
      joinRoom(roomId);
    }
  };

  return game ? <GameContainer game={game} spectators={spectators}/> :
    userName ? <RoomSelector socket={socket} joinRoom={joinRoom} /> :
    <NameSelector chooseUserName={chooseUserName} />;
};

window.addEventListener("orientationchange", () => {
  const angle = Math.abs(window.screen.orientation.angle);
  if(angle === 90 || angle === 270){
    document.body.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

const socket = ioClient.connect();
ReactDOM.render(<App socket={socket}/>, document.getElementById('app'));
