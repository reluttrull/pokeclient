import React, { useEffect, useRef, useState } from 'react';
import Card from './Card.jsx';
import PrizeCard from './PrizeCard.jsx';
import Loading from './Loading.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import './App.css';
import baseset from './data/baseset.json';

const Game = ({gameStateCallback}) => {
  const gameGuid = useRef(null);
  const mulligans = useRef(0);
  const [hand, setHand] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [prizes, setPrizes] = useState([0,3,1,4,2,5]);
  
  const cardCallback = (data) => {
    // update where card is placed
    console.log(`card ${data.num} moved to ${data.pos}`);
    var card = hand.concat(bench).concat(active).find(c => c.numberInDeck == data.num);
    console.log(card);
    placeCardInSpot(card, data.pos);
  };

  function placeCardInSpot(card, spot) {
    switch (spot) {
      case 0:
        if (active) { // this spot occupied, attach card instead
          active.attachedCards.push(card);
        } else { // spot empty, place card in spot
          if (card.category != "Pokemon") {
            //setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck).concat(card)) // send home
            return;
          }
          setActive(card);
        }
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck !== card.numberInDeck));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        if (bench.length > spot && bench[spot]) { // this spot occupied, attach card instead
          bench[spot].attachedCards.push(card);
        } else { // spot empty, place card in spot
          if (card.category != "Pokemon") {
            //setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck).concat(card)) // send home
            return;
          }
          const nextBench = [
            ...bench.slice(0, spot-1),
            card,
            ...bench.slice(spot-1)
          ];
          setBench(nextBench);
        }
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (active.numberInDeck == card.numberInDeck) setActive(null); 
        break;
      case 6:
        console.log('moving to discard');
        // discard any attached cards first
        card.attachedCards.forEach(function(c) {
          setDiscard([c, ...discard]);
          discardCard(c);
        });
        // then discard main card
        setDiscard([card, ...discard]);
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck !== card.numberInDeck));
        else if (active.numberInDeck == card.numberInDeck) setActive(null); 
        discardCard(card);
        break;
      default:
        break;
    }
  }

  function getRandomCard() {
    let rand = Math.floor(Math.random() * baseset.length);
    return baseset[rand];
  }

  function drawPrize(prizeNum) {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/drawcardfromprizes/${gameGuid.current}`)
    .then(response => response.json())
    .then(data => {
      data.prizeCard.attachedCards = [];
      setHand([...hand, data.prizeCard]);
      setPrizes((prizes) => prizes.filter((p) => p != prizeNum));
      if (data.remainingPrizes == 0) {
          gameStateCallback({ ended: true });
      } 
    })
    .catch(error => console.error('Error fetching prize card data:', error));
  }

  function drawTopCard() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/drawcardfromdeck/${gameGuid.current}`)
    .then(response => response.json())
    .then(data => {
      data.attachedCards = [];
      console.log('draw card', data);
      setHand([...hand, data]);
    })
    .catch(error => console.error('Error fetching card data:', error));
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

  function endGame() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/endgame/${gameGuid.current}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.status == 204) {
          console.log('game ended successfully');
          gameStateCallback({ ended: true });
        }
        else console.log(response);
      })
      .catch(error => console.error('Error ending game:', error));
  }

  // on page load
  useEffect(() => {
    if (!gameGuid.current) {
        fetch('https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/0')
        .then(response => response.json())
        .then(data => {
            console.log('set game start');
        if (!data) throw "Game data empty!";
        if (data.gameGuid) gameGuid.current = data.gameGuid;
        if (data.hand) {
          let expandedHand = data.hand.map(card => ({
              ...card,
              attachedCards: []
          }));
          setHand(expandedHand);
        }
        if (data.mulligans) mulligans.current = data.mulligans;
        })
        .catch(error => console.error('Error fetching game start data:', error));
    }
    }, []);


  return (
    <>
    {!gameGuid.current && <Loading />}
    {gameGuid.current &&
    <div>
      <div style={{position: 'absolute', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
      <div style={{position: 'absolute', top: '90px', left: '700px', width: '200px'}}># cards in hand = {hand && hand.length}</div>
      <div style={{position: 'absolute', top: '160px', left: '700px', width: '200px'}}># cards in bench = {bench && bench.length}</div>
      <button onClick={drawTopCard} id="draw-card-button">draw</button>
      <button onClick={endGame} id="end-game-button">end game</button>
      <div id="user-active" className="card-target">
        {active && <Card key={active.numberInDeck} data={active} startOffset={0} snapPosition={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-1" className="card-target">
        {bench.length > 0 && <Card key={bench[0].numberInDeck} data={bench[0]} startOffset={0} snapPosition={1} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-2" className="card-target">
        {bench.length > 1 && <Card key={bench[1].numberInDeck} data={bench[1]} startOffset={0} snapPosition={2} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-3" className="card-target">
        {bench.length > 2 && <Card key={bench[2].numberInDeck} data={bench[2]} startOffset={0} snapPosition={3} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-4" className="card-target">
        {bench.length > 3 && <Card key={bench[3].numberInDeck} data={bench[3]} startOffset={0} snapPosition={4} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-5" className="card-target">
        {bench.length > 4 && <Card key={bench[4].numberInDeck} data={bench[4]} startOffset={0} snapPosition={5} positionCallback={cardCallback} />}
      </div>
      <div id="discard-area" className="card-target">
        {discard.length > 0 && <Card key={discard[0].numberInDeck} data={discard[0]} startOffset={0} snapPosition={6} positionCallback={cardCallback} />}
      </div>
      {prizes.map((prizeNum) =>
          <a href="#" key={prizeNum} onClick={() => drawPrize(prizeNum)} ><PrizeCard prizeNum={prizeNum} /></a>
      )}
      {hand.map((card, index) => (
          <Card key={card.numberInDeck} data={card} startOffset={index * 20} snapPosition={-1} positionCallback={cardCallback} 
          style={{top: '0px', left: '0px', transform: 'translateX(0px) translateY(0px' }} />
        ))}
    </div>}
    </>
  );
};

export default Game;
