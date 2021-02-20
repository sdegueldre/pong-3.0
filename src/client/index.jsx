import ReactDOM from 'react-dom';
import React, {useState, useEffect, useRef} from 'react';
import {RoomSelector} from '/components';
import ioClient from 'socket.io-client/dist/socket.io';
import Game from '/game';

const App = () => {
  const [game, setGame] = useState(null);
  const gameObj = useRef({game, setGame});
  const [socket, setSocket] = useState(null);
  const [joinRoom, setJoinRoom] = useState(() => null);
  const [userName, setUserName] = useState('');
  const [spectators, setSpectators] = useState([]);

  gameObj.current.game = game;
  gameObj.current.setGame = setGame;
  useEffect(() => {
    const socket = ioClient.connect();
    const joinRoom = async (roomId) => {
      socket.emit('joinRoom', roomId);
    };

    socket.on('joinedRoom', () => {
      console.debug('joined room');
      const startGame = ({controlledPlayer, initialBall, players, spectators}) => {
        console.debug('game started');
        if(spectators){
          setSpectators(spectators);
        }
        gameObj.current.setGame(new Game(controlledPlayer, initialBall, socket, players));
      };
      socket.once('gameStarted', startGame);
      socket.once('roomClosed', () => {
        console.debug('Room closed, back to room selector');
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

    setSocket(socket);
    setJoinRoom(() => joinRoom);
  }, []);

  const userNameSubmit = ev => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const {userName} = Object.fromEntries(formData.entries());
    setUserName(userName);
    socket.emit('setUserName', userName);
    const roomId = new URL(window.location).hash.slice(1);
    if(roomId){
      joinRoom(roomId);
    }
  };

  return <>
    {socket && (
      !userName ?
      <div className="username-selector">
        <form className="d-flex" onSubmit={userNameSubmit} style={{fontSize: '1rem'}}>
          <input placeholder="Enter a nickname..." name="userName" className="neon-border" />
          <button type="submit" className="ml">Go</button>
        </form>
      </div>
      :
      <RoomSelector className={game ? "hidden" : ""} socket={socket} joinRoom={joinRoom} />
    )}
    <div className={`game-container${game ? "" : " hidden"}`}>
      <ul className="spectators-list">
        {spectators.map(spectator => <li key={spectator}>{spectator}</li>)}
      </ul>
    </div>
  </>;
};

ReactDOM.render(<App/>, document.getElementById('app'));
