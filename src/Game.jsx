import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { PiCardsThree } from 'react-icons/pi';
import Card from './Card.jsx';
import PrizeCard from './PrizeCard.jsx';
import CoinFlip from './CoinFlip.jsx';
import Loading from './Loading.jsx';
import Deck from './Deck.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import './App.css';
import baseset from './data/baseset.json';

const Game = ({deckNumber, gameStateCallback}) => {
  const gameGuid = useRef(null);
  const mulligans = useRef(0);
  const [hand, setHand] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [prizes, setPrizes] = useState([0,3,1,4,2,5]);
  const [coinResult, setCoinResult] = useState(null);
  const [isSelectingDeck, setIsSelectingDeck] = useState(false);
  const [isSelectingDiscard, setIsSelectingDiscard] = useState(false);
  const [cardsInDeck, setCardsInDeck] = useState([]);
  const [cardsInDiscard, setCardsInDiscard] = useState([]);
  const [numberInDeck, setNumberInDeck] = useState(47);
  const [rerenderKey, setRerenderKey] = useState(0);
  Modal.setAppElement('#root');
  
  const cardCallback = (data) => {
    // update where card is placed
    console.log(`card ${data.card.numberInDeck} moved to ${data.pos}`);
    var card = data.card;
    console.log(card);
    placeCardInSpot(card, data.pos);
  };

  function placeCardInSpot(card, spot) {
    switch (spot) {
      case -1: // moving to hand
        if (hand.includes(card)) break; // card already belongs to hand and will snap back on its own
        let attached = card.attachedCards.map(card => ({ ...card, damageCounters: 0 }));
        card.attachedCards = [];
        card.damageCounters = 0;
        setHand([...hand, ...attached, card]); // return card and all attached to it to hand
        if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck != card.numberInDeck));
        else if (active && active.numberInDeck == card.numberInDeck) setActive(null); 
        break;
      case 0: // moving to active
        if (active) { // this spot occupied, attach card instead
          let isAttachedSuccessful = attachCard(card, true);
          if (!isAttachedSuccessful) return; // not valid, send back
        } else { // spot empty, place card in spot
          if (card.category != "Pokemon" || 
            (card.stage != "Basic" && !card.attachedCards.find((card) => card.stage && card.stage == "Basic"))) {
            return; // send back
          }
          setActive(card);
        }
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck != card.numberInDeck));
        else if (bench.includes(card)) setBench((bench) => bench.filter((c) => c.numberInDeck != card.numberInDeck));
        break;
      case 1: // moving to bench
      case 2:
      case 3:
      case 4:
      case 5:
        spot--; // 0-index
        if (bench.length > spot && bench[spot]) { // this spot occupied, attach card instead
          let isAttachedSuccessful = attachCard(card, false, spot);
          if (!isAttachedSuccessful) return; // not valid, send back
        } else { // spot empty, place card in spot
          if (card.category != "Pokemon" || 
            (card.stage != "Basic" && !card.attachedCards.find((card) => card.stage && card.stage == "Basic"))) {
            return; // send back
          }
          setBench([...bench, card]); // always place at the end
        }
        if (hand.includes(card)) setHand((hand) => hand.filter((c) => c.numberInDeck != card.numberInDeck));
        else if (active && active.numberInDeck == card.numberInDeck) setActive(null); 
        else if (bench.includes(card)) setBench([...new Set(bench)]);
        break;
      case 6: // moving to discard
        // discard any attached cards first
        card.attachedCards.forEach(function(c) {
          setDiscard([c, ...discard]);
          discardCard(c);
        });
        // then discard main card
        setDiscard([card, ...discard]);
        removeCard(card);
        discardCard(card);
        break;
      case 7: // deck
        card.attachedCards.forEach(attachedCard => returnToDeck(attachedCard));
        returnToDeck(card);
        removeCard(card);
        break;
      default:
        break;
    }
  }

  function removeCard(cardToRemove) {
    if (hand.includes(cardToRemove)) setHand((hand) => hand.filter((c) => c.numberInDeck != cardToRemove.numberInDeck));
    else if (bench.includes(cardToRemove)) setBench((bench) => bench.filter((c) => c.numberInDeck != cardToRemove.numberInDeck));
    else if (active.numberInDeck == cardToRemove.numberInDeck) setActive(null); 
  }

  function attachCard(cardToAttach, isActive, benchPosition = -1) {
    // attach to active
    console.log('attaching', cardToAttach);
    if (isActive) {
      if (cardToAttach.category == "Energy") {
        active.attachedCards.push(cardToAttach);
      } else if (cardToAttach.evolveFrom && cardToAttach.evolveFrom == active.name) {
        let attached = active.attachedCards;
        active.attachedCards = [];
        cardToAttach.attachedCards = [...attached, active];
        cardToAttach.damageCounters = active.damageCounters;
        setActive(cardToAttach);
      } else return false; // not a valid card to attach, send back
      return true;
    }
    // attach to bench
    if (cardToAttach.category == "Energy") {
      bench[benchPosition].attachedCards.push(cardToAttach);
    } else if (cardToAttach.evolveFrom && cardToAttach.evolveFrom == bench[benchPosition].name) {
      // move energies and prior evolutions to attached cards of new top card
      let attached = bench[benchPosition].attachedCards;
      bench[benchPosition].attachedCards = [];
      cardToAttach.attachedCards = [...attached, bench[benchPosition]];
      cardToAttach.damageCounters = bench[benchPosition].damageCounters;
      // replace the prior evolution card on the bench without mutating the array
      let newBench = bench.map((card, index) => {
        if (index == benchPosition) return cardToAttach;
        else return card;
      });
      setBench(newBench);
    } else return false; // not a valid card to attach, send back
    return true;
  }

  function returnToDeck(card) {
    console.log(`returning card ${card.numberInDeck} to deck`);
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/placecardonbottomofdeck/${gameGuid.current}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      })
      .then(response => {
        if (response.status == 204) console.log('returned card to bottom of deck successfully');
        else console.log(response);
      })
      .catch(error => console.error('Error returning card to deck:', error));
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
      data.prizeCard.damageCounters = 0;
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
      data.damageCounters = 0;
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

  function getCoinFlip() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/flipcoin`)
    .then(response => response.json())
    .then(data => {
      console.log('flipped coin', data);
      setCoinResult(data);
    })
    .catch(error => console.error('Error fetching data:', error));
  }

  function closeCoinFlip() {
    setCoinResult(null);
  }

  function handleShuffle() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/shuffledeck/${gameGuid.current}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.status == 204) {
          console.log('deck shuffled successfully');
        }
        else console.log(response);
      })
      .catch(error => console.error('Error shuffling deck:', error));
  }

  function handleCloseSelectFromDeck (event) {
    setIsSelectingDeck(false);
  }

  function handleSelectFromDeck (event) {
      fetchCardsFromDeck();
      setIsSelectingDeck(true);
  }

  function handleCloseSelectFromDiscard (event) {
      setIsSelectingDiscard(false);
  }

  function handleSelectFromDiscard (event) {
      setIsSelectingDiscard(true);
  }

  function fetchCardsFromDeck() {
      fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/peekatallcardsindeck/${gameGuid.current}`)
      .then(response => response.json())
      .then(data => {
          setCardsInDeck(data);
      })
      .catch(error => console.error('Error fetching deck:', error));
  }

  function addFromDeckToHand(card) {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/drawthiscardfromdeck/${gameGuid.current}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      })
      .then(response => {
        if (response.status == 204) {
          console.log('selected card from deck successfully');
          card.attachedCards = [];
          card.damageCounters = 0;
          setHand([...hand, card]);
          setCardsInDeck(cardsInDeck.filter(c => c.numberInDeck != card.numberInDeck));
        }
        else console.log(response);
      })
      .catch(error => console.error('Error selecting card from deck:', error));
  }
  
  function addFromDiscardToHand(card) {
    // currently the server doesn't know what's in the discard pile (and doesn't need to yet)
    card.attachedCards = [];
    card.damageCounters = 0;
    setHand([...hand, card]);
    setDiscard(discard.filter(c => c.numberInDeck != card.numberInDeck));
  }

  function tightenHandLayout (event) {
    let sorted = [...hand];
    sorted.sort((a,b) => a.category.localeCompare(b.category));
    sorted.forEach((card) => console.log(card));
    setHand(sorted);
    setRerenderKey(prev => prev + 1); // trigger re-render
  }

  useEffect(() => {
    setNumberInDeck(60 - hand.length - bench.length - discard.length - prizes.length - (active ? 1 : 0));
  }, [hand, active, bench, discard, prizes]);

  // on page load
  useEffect(() => {
    if (!gameGuid.current) {
        fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/${deckNumber}`)
        .then(response => response.json())
        .then(data => {
            console.log('set game start');
        if (!data) throw "Game data empty!";
        if (data.gameGuid) gameGuid.current = data.gameGuid;
        if (data.hand) {
          let expandedHand = data.hand.map(card => ({
              ...card,
              attachedCards: [],
              damageCounters: 0
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
    {isSelectingDeck && 
        <Modal className="card-overlay-container"
            isOpen={isSelectingDeck}
            onRequestClose={handleCloseSelectFromDeck}
            contentLabel="Deck Card Select Overlay"
            onClick={handleCloseSelectFromDeck}
          >
            {cardsInDeck.map(card => <a href="#" key={'deckselect'+card.numberInDeck} onClick={() => addFromDeckToHand(card)}><img src={`${card.image}/low.webp`} className='card-size' /></a>)}
            <button onClick={handleCloseSelectFromDeck}>Done selecting cards</button>
        </Modal>}
    {isSelectingDiscard && 
        <Modal className="card-overlay-container"
            isOpen={isSelectingDiscard}
            onRequestClose={handleCloseSelectFromDiscard}
            contentLabel="Discard Card Select Overlay"
            onClick={handleCloseSelectFromDiscard}
          >
            {discard.map(card => <a href="#" key={'discardselect'+card.numberInDeck} onClick={() => addFromDiscardToHand(card)}><img src={`${card.image}/low.webp`} className='card-size' /></a>)}
            <button onClick={handleCloseSelectFromDiscard}>Done selecting cards</button>
        </Modal>}
    {gameGuid.current &&
    <div>
      <div style={{position: 'absolute', top: '50px', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
      <div style={{position: 'absolute', top: '100px', left: '700px', width: '200px'}}># cards in hand = {hand && hand.length}</div>
      <div style={{position: 'absolute', top: '150px', left: '700px', width: '200px'}}># cards in bench = {bench && bench.length}</div>
      <button onClick={getCoinFlip} id="flip-coin-button">flip coin</button>
      <button onClick={drawTopCard} id="draw-card-button">draw</button>
      <button onClick={endGame} id="end-game-button">end game</button>
      <div id="user-active" className="card-target">
        {active && <Card key={active.numberInDeck} data={active} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-1" className="card-target">
        {bench.length > 0 && <Card key={bench[0].numberInDeck} data={bench[0]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-2" className="card-target">
        {bench.length > 1 && <Card key={bench[1].numberInDeck} data={bench[1]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-3" className="card-target">
        {bench.length > 2 && <Card key={bench[2].numberInDeck} data={bench[2]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-4" className="card-target">
        {bench.length > 3 && <Card key={bench[3].numberInDeck} data={bench[3]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="user-bench-5" className="card-target">
        {bench.length > 4 && <Card key={bench[4].numberInDeck} data={bench[4]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <div id="discard-area" className="card-target">
        <button id="discard-select-button" className="button" onClick={handleSelectFromDiscard}>Select from discard</button>
        {discard.length > 0 && <Card key={discard[0].numberInDeck} data={discard[0]} startOffset={0} positionCallback={cardCallback} />}
      </div>
      <Deck displayNum={numberInDeck} shuffleCallback={handleShuffle} selectCallback={handleSelectFromDeck} />
      {prizes.map((prizeNum) =>
          <a href="#" key={prizeNum} onClick={() => drawPrize(prizeNum)} ><PrizeCard prizeNum={prizeNum} /></a>
      )}
      <div id="hand-area" className="card-target">
        <PiCardsThree id="hand-tighten-button" className="icon-button" onClick={tightenHandLayout} 
            alt="tighten up hand layout" title="tighten up hand layout" />
        {hand.map((card, index) => (
            <Card key={`${card.numberInDeck}-${rerenderKey}`} data={card} startOffset={index * 20} positionCallback={cardCallback} />
          ))}
      </div>
    </div>}
        {coinResult != null && <Modal className="coin-flip-container"
            isOpen={getCoinFlip}
            onRequestClose={closeCoinFlip}
            contentLabel="Coin Flip"
            onClick={closeCoinFlip}
          ><CoinFlip isHeads={coinResult} />
        </Modal>}
    </>
  );
};

export default Game;
