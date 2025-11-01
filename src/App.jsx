import React, { useEffect, useState } from 'react';
import CoinFlip from './CoinFlip.jsx';
import Game from './Game.jsx';
import './App.css';
import { apiGetAllDeckBriefs } from './deckApi.js';
import baseset from './data/baseset.json';

const App = () => {
  const [deckBriefs, setDeckBriefs] = useState([]);
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
  
  // on mount
  useEffect(() => {
    apiGetAllDeckBriefs(setDeckBriefs);
  }, []);

  return (
    <>
      {!gameStarted && 
        <div style={{textAlign:'left'}}>
          {deckBriefs && deckBriefs.map(brief => 
          <div key={brief.deckId}>
            <input type="radio" id={brief.name} value={brief.deckId} checked={deckNum == brief.deckId} onChange={handleDeckNumChange} />
            <label htmlFor={brief.name}>{brief.name}</label>
          <br />
          </div>)}
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
