import React, { useEffect } from 'react';
import type Game from '../game';

const GameContainer = ({ game, spectators }: { game: Game, spectators: string[] }) => {
  useEffect(() => {
    game.resizeHandler();
  }, [game]);

  const appendGame = (container: HTMLElement | null) => {
    if(container){
      container.innerHTML = "";
      container.appendChild(game.element);
    }
  };

  return (
    <div className="game-container" ref={appendGame}>
      <ul className="spectators-list">
        {spectators.map(spectator => <li key={spectator}>{spectator}</li>)}
      </ul>
    </div>
  );
};

export default GameContainer;
