import React, { useEffect } from 'react';

const GameContainer = ({ game, spectators }) => {
  useEffect(() => {
    game.resizeHandler();
  }, [game]);

  return (
    <div className="game-container" ref={container => container && container.appendChild(game.element)}>
      <ul className="spectators-list">
        {spectators.map(spectator => <li key={spectator}>{spectator}</li>)}
      </ul>
    </div>
  );
};

export default GameContainer;
