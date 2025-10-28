import React, { useState } from 'react';
import CoinFlip from './CoinFlip.jsx';
import Game from './Game.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {
  const [deckNum, setDeckNum] = useState("0");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [coinResult, setCoinResult] = useState(null);

  function startGame() {
    getCoinFlip();
    setTimeout(() => {
      setCoinResult(null);
      setGameStarted(true);
    }, 5000);
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

  function handleDeckNumChange(event) {
    setDeckNum(event.target.value);
  }

  return (
    <>
      {!gameStarted && 
        <div>
          <input type="radio" id="haymaker" value="0" checked={deckNum == "0"} onChange={handleDeckNumChange} />
          <label for="haymaker">Haymaker</label>
          <input type="radio" id="raindance" value="1" checked={deckNum == "1"} onChange={handleDeckNumChange} />
          <label for="raindance">Rain Dance</label>
          <br />
          <br />
          <button onClick={startGame}>Start game</button>
        </div>}
      {coinResult != null && !gameStarted && <CoinFlip isHeads={coinResult} />}
      {gameStarted && !gameEnded && <Game deckNumber={deckNum} gameStateCallback={gameStateCallback} />}
      {gameEnded && <h1>Game over</h1>}
    </>
  );
};

export default App;
