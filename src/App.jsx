import React, { useState } from 'react';
import Game from './Game.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [coinResult, setCoinResult] = useState(null);

  function startGame() {
    getCoinFlip();
    setTimeout(() => {
      setGameStarted(true);
    }, 3000);
  }

  function getCoinFlip() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/flipcoin`)
    .then(response => response.json())
    .then(data => {
      console.log('flipped coin', data);
      setCoinResult(data);
    })
    .catch(error => console.error('Error fetching data:', error));
  }

  function gameStateCallback(data) {
    if (data.ended) {
      setGameEnded(true);
    }
  }

  return (
    <>
      {!gameStarted && <button onClick={startGame}>Start game</button>}
      {coinResult != null && !gameStarted && <div>{coinResult ? 'heads' : 'tails'}</div>}
      {gameStarted && !gameEnded && <Game gameStateCallback={gameStateCallback} />}
      {gameEnded && <h1>Game over</h1>}
    </>
  );
};

export default App;
