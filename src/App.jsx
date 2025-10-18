import React, { useEffect, useState } from 'react';
import Card from './Card.jsx';
import PrizeCard from './PrizeCard.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {
  const [gameStartData, setGameStartData] = useState({});

  function getRandomCard() {
    let rand = Math.floor(Math.random() * baseset.length);
    return baseset[rand];
  }

  // on page load
  useEffect(() => {
    fetch('https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/0')
    .then(response => response.json())
    .then(data => setGameStartData(data))
    .catch(error => console.error('Error fetching data:', error));
    }, []);

  return (
    <>
    <div id="user-active"></div>
    <div id="user-bench-1"></div>
    <div id="user-bench-2"></div>
    <div id="user-bench-3"></div>
    <div id="user-bench-4"></div>
    <div id="user-bench-5"></div>
    {gameStartData && gameStartData.hand 
    && gameStartData.hand.map((card, index) => (
          <Card data={card} startOffset={index * 20} />
        ))}
    <PrizeCard prizeNum={0} />
    <PrizeCard prizeNum={1} />
    <PrizeCard prizeNum={2} />
    <PrizeCard prizeNum={3} />
    <PrizeCard prizeNum={4} />
    <PrizeCard prizeNum={5} />
    </>
  );
};

export default App;
