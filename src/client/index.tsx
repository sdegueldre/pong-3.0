import { createRoot } from 'react-dom/client';
import { useState, useEffect, StrictMode } from 'react';
import RoomSelector from "./components/RoomSelector";
import NameSelector from "./components/NameSelector";
import GameContainer from "./components/GameContainer";
import ioClient from 'socket.io-client/dist/socket.io';
import Game from './game';
import { EventEmitter } from "events";
import type ClientBallOptions from './game/objects/Ball';

type Spectator = string;

type GameInit = {
  controlledPlayer: number,
  initialBall: ClientBallOptions,
  players: string[],
  spectators: Spectator[],
}

const App = ({ socket }: { socket: EventEmitter }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [userName, setUserName] = useState('');
  const [spectators, setSpectators] = useState<Spectator[]>([]);

  const joinRoom = async (roomId: string) => {
    socket.emit('joinRoom', roomId);
  };

  useEffect(() => {
    if(!game){
      socket.on('joinedRoom', () => {
        const startGame = ({ controlledPlayer, initialBall, players, spectators }: GameInit) => {
          if(spectators){
            setSpectators(spectators);
          }
          setGame(new Game(controlledPlayer, initialBall, socket, players, setGame));
        };
        socket.once('gameStarted', startGame);
        socket.once('roomClosed', () => {
          socket.off('gameStarted', startGame);
          setGame(game => {
            if(game){
              game.destroy();
            }
            return null;
          });
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

  const chooseUserName = (userName: string) => {
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
const root = createRoot(document.getElementById('app')!);
root.render(<StrictMode><App socket={socket}/></StrictMode>);
