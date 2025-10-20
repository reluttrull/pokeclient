import React, { useEffect, useRef, useState } from 'react';
import Card from './Card.jsx';
import PrizeCard from './PrizeCard.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {
  const gameGuid = useRef(null);
  const mulligans = useRef(0);
  const [hand, setHand] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  const [discard, setDiscard] = useState([]);
  
  const cardCallback = (data) => {
    // update where card is placed
    console.log(`card ${data.num} moved to ${data.pos}`);
    var card = hand.concat(bench).concat(active).find(c => c.numberInDeck == data.num);
    switch (data.pos) {
      case 0:
        // TODO: handle when card moving from somewhere else
        setActive(card); // TODO: handle when another card is in the active spot
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck !== card.numberInDeck));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        const nextBench = [
          ...bench.slice(0, data.pos-1),
          card,
          ...bench.slice(data.pos-1)
        ];
        setBench(nextBench);
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (active.numberInDeck == card.numberInDeck) setActive(null); 
        break;
      case 6:
        console.log('moving to discard');
        setDiscard([card, ...discard]);
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (active.numberInDeck == card.numberInDeck) setActive(null); 
        discardCard(card);
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
      console.log('draw card', data);
      setHand([...hand, data]);
    })
    .catch(error => console.error('Error fetching data:', error));
  }

  function discardCard(card) {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/discardcard/${gameGuid.current}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      })
      .then(response => {
        if (response.status == 204) console.log('discarded card successfully');
        else console.log(response);
      })
      .catch(error => console.error('Error discarding card:', error));
  }

  // on page load
  useEffect(() => {
    fetch('https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/0')
    .then(response => response.json())
    .then(data => {
      if (!data) throw "Game data empty!";
      if (data.gameGuid) gameGuid.current = data.gameGuid;
      if (data.hand) setHand(data.hand);
      if (data.mulligans) mulligans.current = data.mulligans;
    })
    .catch(error => console.error('Error fetching data:', error));
    }, []);


  return (
    <>
    <div style={{position: 'absolute', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
    <div style={{position: 'absolute', top: '90px', left: '700px', width: '200px'}}># cards in hand = {hand && hand.length}</div>
    <div style={{position: 'absolute', top: '160px', left: '700px', width: '200px'}}># cards in bench = {bench && bench.length}</div>
    <button onClick={drawTopCard} style={{position: 'absolute', top: '240px', left: '700px', width: '200px'}}>draw</button>
    <div id="user-active">
      {active && <Card key={active.numberInDeck} data={active} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="user-bench-1">
      {bench.length > 0 && <Card key={bench[0].numberInDeck} data={bench[0]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="user-bench-2">
      {bench.length > 1 && <Card key={bench[1].numberInDeck} data={bench[1]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="user-bench-3">
      {bench.length > 2 && <Card key={bench[2].numberInDeck} data={bench[2]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="user-bench-4">
      {bench.length > 3 && <Card key={bench[3].numberInDeck} data={bench[3]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="user-bench-5">
      {bench.length > 4 && <Card key={bench[4].numberInDeck} data={bench[4]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    <div id="discard-area">
      {discard.length > 0 && <Card key={discard[0].numberInDeck} data={discard[0]} startOffset={0} positionCallback={cardCallback} />}
    </div>
    {hand.map((card, index) => (
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
