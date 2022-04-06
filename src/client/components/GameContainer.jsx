import React, { useEffect } from 'react';

const GameContainer = ({ game, spectators }) => {
  useEffect(() => {
    game.resizeHandler();
  }, [game]);

  const appendGame = container => {
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
