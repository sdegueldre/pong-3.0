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
  const [userName, setUserName] = useState('');
  const userNameInput = useRef(null);

  gameObj.current.game = game;
  gameObj.current.setGame = setGame;
  useEffect(() => {
    const socket = ioClient.connect();
    const joinRoom = async (roomId) => {
      socket.emit('joinRoom', roomId);
    };

    socket.on('joinedRoom', () => {
      console.debug('joined room');
      const startGame = ({controlledPlayer, initialBall, players}) => {
        console.debug('game started');
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

    const roomId = new URL(window.location).hash.slice(1);
    if(roomId){
      joinRoom(roomId);
    }
    setSocket(socket);
    setJoinRoom(() => joinRoom);
  }, []);

  const userNameSubmit = ev => {
    ev.preventDefault();
    const userName = userNameInput.current.value;
    setUserName(userName);
    socket.emit('setUserName', userName);
  };

  return <>
    {socket && (
      !userName ? <div className="username-selector">
        <form className="d-flex" onSubmit={userNameSubmit} style={{fontSize: '1rem'}}>
          <input placeholder="Enter a nickname..." ref={userNameInput} />
          <input type="submit" className="ml" value="Go"/>
        </form>
      </div>
      :
      <RoomSelector className={game ? "hidden" : ""} socket={socket} joinRoom={joinRoom} userName={userName}/>
    )}
    <div className={`game-container${game ? "" : " hidden"}`}></div>
  </>;
};

ReactDOM.render(<App/>, document.getElementById('app'));
