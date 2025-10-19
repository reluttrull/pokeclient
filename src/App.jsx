import React, { useEffect, useRef, useState } from 'react';
import Card from './Card.jsx';
import PrizeCard from './PrizeCard.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {
  const gameGuid = useRef(null);
  const mulligans = useRef(0);
  const [cardsInPlay, setCardsInPlay] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  
  const cardCallback = (data) => {
    // update where card is placed
    console.log(`card ${data.num} moved to ${data.pos}`);
    switch (data.pos) {
      case 0:
        var card = cardsInPlay.find(c => c.numberInDeck == data.num); // TODO: handle when card moving from somewhere else
        setActive(card); // TODO: handle when another card is in the active spot
        break;
      default:
        break;
    }
  };

  function getRandomCard() {
    let rand = Math.floor(Math.random() * baseset.length);
    return baseset[rand];
  }

  function drawTopCard() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/drawcardfromdeck/${gameGuid.current}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setCardsInPlay([...cardsInPlay, data]);
    })
    .catch(error => console.error('Error fetching data:', error));
  }

  // on page load
  useEffect(() => {
    fetch('https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/0')
    .then(response => response.json())
    .then(data => {
      if (!data) throw "Game data empty!";
      if (data.gameGuid) gameGuid.current = data.gameGuid;
      if (data.hand) setCardsInPlay(data.hand);
      if (data.mulligans) mulligans.current = data.mulligans;
    })
    .catch(error => console.error('Error fetching data:', error));
    }, []);


  return (
    <>
    <div style={{position: 'absolute', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
    <div style={{position: 'absolute', top: '100px', left: '700px', width: '200px'}}>total cards in play = {cardsInPlay && cardsInPlay.length}</div>
    <button onClick={drawTopCard} style={{position: 'absolute', top: '200px', left: '700px', width: '200px'}}>draw</button>
    <div id="user-active"></div>
    <div id="user-bench-1"></div>
    <div id="user-bench-2"></div>
    <div id="user-bench-3"></div>
    <div id="user-bench-4"></div>
    <div id="user-bench-5"></div>
    <div id="discard-area"></div>
    {cardsInPlay.map((card, index) => (
          <Card key={card.numberInDeck} data={card} startOffset={index * 20} positionCallback={cardCallback} />
        ))}
    <PrizeCard prizeNum={0} />
    <PrizeCard prizeNum={3} />
    <PrizeCard prizeNum={1} />
    <PrizeCard prizeNum={4} />
    <PrizeCard prizeNum={2} />
    <PrizeCard prizeNum={5} />
    </>
  );
};

export default App;
