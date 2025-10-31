import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import PlayArea from './PlayArea.jsx';
import CoinFlip from './CoinFlip.jsx';
import Loading from './Loading.jsx';
import './App.css';

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
  const [numberInDeck, setNumberInDeck] = useState(47);
  const [rerenderKey, setRerenderKey] = useState(0);
  Modal.setAppElement('#root');
  
  const cardCallback = (data) => {
    // update where card is placed
    console.log(`card ${data.card.numberInDeck} moved to ${data.pos}`);
    var card = data.card;
    placeCardInSpot(card, data.pos);
  };

  async function placeCardInSpot(card, spot) {
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
        if (active) { // this spot occupied, attach or swap card instead
          let isAttachedSuccessful = await attachOrSwapCard(card, true);
          if (!isAttachedSuccessful) break; // not valid, send back
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
        if (bench.length > spot && bench[spot]) { // this spot occupied, attach or swap card instead
          let isAttachedSuccessful = await attachOrSwapCard(card, false, spot);
          if (!isAttachedSuccessful) break; // not valid, send back
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
        let newDiscard = [...card.attachedCards, ...discard];
        card.attachedCards = [];
        newDiscard = [card, ...newDiscard];
        // then discard main card
        setDiscard(newDiscard);
        removeCard(card);
        console.log('discarded card successfully');
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

async function getValidEvolutionNames(pokemonName) {
  try {
    const response = await fetch(
      `https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getvalidevolutions/${pokemonName}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching evolution data:', error);
    return [];
  }
}

  async function attachOrSwapCard(cardToAttach, isActive, benchPosition = -1) {
    if (cardToAttach.name == "Pokémon Breeder") {
      let baseName = isActive ? active.name : bench[benchPosition].name;
      let validStageOneNames = await getValidEvolutionNames(baseName);
      let stageTwo = hand.find(card => validStageOneNames.includes(card.evolveFrom));
      if (!stageTwo) {
        console.log(`Pokemon Breeder: ${baseName} skips ${stageTwo.evolveFrom} and evolves into ${stageTwo.name}`);
        tightenHandLayout();
        return false; // should send "Pokemon Breeder" card back to hand
      } else if (isActive) {
        stageTwo.attachedCards = [...active.attachedCards];
        active.attachedCards = [];
        stageTwo.attachedCards.push(active);
        setActive(stageTwo);
      } else {
        stageTwo.attachedCards = [...bench[benchPosition].attachedCards];
        bench[benchPosition].attachedCards = [];
        stageTwo.attachedCards.push(bench[benchPosition]);
        let newBench = bench.map((card, index) => {
          if (index == benchPosition) return stageTwo;
          else return card;
        });
        setBench(newBench);
      }
      // take stage two and trainer card out of hand, move trainer to discard
      setHand(hand.filter(card => card.numberInDeck != stageTwo.numberInDeck && card.numberInDeck != cardToAttach.numberInDeck));
      setDiscard([...discard, cardToAttach]);
      return false;
    }
    // attach to active
    console.log('attaching', cardToAttach);
    if (isActive) {
      if (cardToAttach.category == "Energy") { // attach energy
        active.attachedCards.push(cardToAttach);
      } else if (hand.includes(cardToAttach) // evolve
            && cardToAttach.evolveFrom && cardToAttach.evolveFrom == active.name) {
        let attached = active.attachedCards;
        active.attachedCards = [];
        cardToAttach.attachedCards = [...attached, active];
        cardToAttach.damageCounters = active.damageCounters;
        setActive(cardToAttach);
      } else if (bench.includes(cardToAttach)) { // swap
        // swap with bench
        let newActive = cardToAttach;
        let newBench = bench.filter((card) => card.numberInDeck != cardToAttach.numberInDeck);
        newBench.push(active);
        setBench(newBench);
        setActive(newActive);
        return false;
      } else return false; // not a valid card to attach, send back
      return true;
    }
    // attach to bench
    if (cardToAttach.category == "Energy") { // attach energy
      bench[benchPosition].attachedCards.push(cardToAttach);
    } else if (hand.includes(cardToAttach) // evolve
          && cardToAttach.evolveFrom && cardToAttach.evolveFrom == bench[benchPosition].name) {
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
    } else if (active == cardToAttach) { // swap
      // swap with active
      setActive(bench[benchPosition]);
      let newBench = bench.map((card, index) => {
        if (index == benchPosition) return cardToAttach;
        else return card;
      });
      setBench(newBench);
      return false;
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

  function tightenHandLayout () {
    let sorted = [...hand];
    sorted.sort((a,b) => a.category.localeCompare(b.category));
    setHand(sorted);
    setRerenderKey(prev => prev + 1); // trigger re-render
  }

  useEffect(() => {
    let totalAttached = 0; 
    bench.forEach(card => totalAttached += card.attachedCards.length);
    if (active) totalAttached += active.attachedCards.length;
    setNumberInDeck(60 - hand.length - bench.length - discard.length - prizes.length - (active ? 1 : 0) - totalAttached);
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
        {gameGuid.current && (
          <>
          <PlayArea
            hand={hand}
            bench={bench}
            active={active}
            discard={discard}
            prizes={prizes}
            numberInDeck={numberInDeck}
            rerenderKey={rerenderKey}
            cardCallback={cardCallback}
            tightenHandLayout={tightenHandLayout}
            drawPrize={drawPrize}
            handleSelectFromDiscard={handleSelectFromDiscard}
            handleSelectFromDeck={handleSelectFromDeck}
            handleShuffle={handleShuffle}
          />      
          <button onClick={getCoinFlip} id="flip-coin-button">flip coin</button>
          <button onClick={drawTopCard} id="draw-card-button">draw</button>
          <button onClick={endGame} id="end-game-button">end game</button>
          </>
        )}
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