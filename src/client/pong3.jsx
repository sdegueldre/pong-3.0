import ReactDOM from 'react-dom';
import React, {useState, useEffect, useRef} from 'react';
import RoomSelector from './RoomSelector';
import ioClient from 'socket.io-client/dist/socket.io';
import Game from './Game';

const App = () => {
  const [game, setGame] = useState(null);
  const gameObj = useRef({game, setGame});
  const [socket, setSocket] = useState(null);
  const [joinRoom, setJoinRoom] = useState(() => null);

  gameObj.current.game = game;
  gameObj.current.setGame = setGame;
  useEffect(() => {
    const socket = ioClient.connect();
    const joinRoom = async (roomId) => {
      socket.emit('joinRoom', roomId);
    };

    socket.on('joinedRoom', () => {
      console.log('joined room');
      const startGame = data => {
        console.log('game started');
        gameObj.current.setGame(new Game(data.controlledPlayer, data.initialBall, socket));
      };
      socket.once('gameStarted', startGame);
      socket.once('roomClosed', () => {
        console.log('Room closed, back to room selector');
        socket.off('gameStarted', startGame);
        if(gameObj.current.game){
          gameObj.current.game.destroy();
          gameObj.current.setGame(null);
        }
      });
    })

    const roomId = new URL(window.location).hash.slice(1);
    if(roomId){
      joinRoom(roomId);
    }
    setSocket(socket);
    setJoinRoom(() => joinRoom);
  }, []);

  return <>
    {socket && <RoomSelector className={game ? "hidden" : ""} socket={socket} joinRoom={joinRoom}/>}
    <div className={`game-container${game ? "" : " hidden"}`}></div>
  </>
}

ReactDOM.render(<App/>, document.getElementById('app'));
