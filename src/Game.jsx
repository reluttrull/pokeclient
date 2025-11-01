// Game.jsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import confirm from './ConfirmationDialog.jsx';
import PlayArea from "./PlayArea.jsx";
import CoinFlip from "./CoinFlip.jsx";
import Loading from "./Loading.jsx";
import {
  initializeGame,
  placeCardInSpot,
  attachOrSwapCard,
  tightenHandLayoutLogic,
} from "./gameLogic.js";
import {
  apiReturnToDeck,
  apiDrawPrize,
  apiDrawTopCard,
  apiEndGame,
  apiFlipCoin,
  apiShuffleDeck,
  apiFetchCardsFromDeck,
  apiDrawSpecificCard,
} from "./gameApi.js";
import "./App.css";

const Game = ({ deckNumber, gameStateCallback }) => {
  Modal.setAppElement("#root");

  // State
  const gameGuid = useRef(null);
  const mulligans = useRef(0);
  const [hand, setHand] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [prizes, setPrizes] = useState([0, 3, 1, 4, 2, 5]);
  const [coinResult, setCoinResult] = useState(null);
  const [isSelectingDeck, setIsSelectingDeck] = useState(false);
  const [isSelectingDiscard, setIsSelectingDiscard] = useState(false);
  const [cardsInDeck, setCardsInDeck] = useState([]);
  const [numberInDeck, setNumberInDeck] = useState(47);
  const [rerenderKey, setRerenderKey] = useState(0);

  const cardCallback = (data) => {
    placeCardInSpot({
      card: data.card,
      spot: data.pos,
      state: { hand, active, bench, discard },
      setState: { setHand, setActive, setBench, setDiscard },
      helpers: {
        attachOrSwapCard: (card, isActive, benchPos) =>
          attachOrSwapCard(card, isActive, benchPos, { hand, active, bench, discard }, { setHand, setActive, setBench, setDiscard }),
        apiReturnToDeck,
      },
      gameGuid,
    });
  };

  // api handlers
  const drawPrize = (prizeNum) =>
    apiDrawPrize(gameGuid, hand, setHand, setPrizes, prizeNum, gameStateCallback);
  const drawTopCard = () => apiDrawTopCard(gameGuid, hand, setHand);
  const endGame = () => apiEndGame(gameGuid, gameStateCallback);
  const getCoinFlip = () => apiFlipCoin(setCoinResult);
  const closeCoinFlip = () => setCoinResult(null);
  const handleShuffle = () => apiShuffleDeck(gameGuid);
  const handleSelectFromDeck = () => {
    apiFetchCardsFromDeck(gameGuid, setCardsInDeck);
    setIsSelectingDeck(true);
  };
  const handleCloseSelectFromDeck = () => setIsSelectingDeck(false);
  const handleSelectFromDiscard = () => setIsSelectingDiscard(true);
  const handleDiscardHand =  async () => {
    if (await confirm({ confirmation: 'Do you really want to discard your whole hand?' })) {
      setDiscard([...hand, ...discard]);
      setHand([]);
    }
  }
  const handleCloseSelectFromDiscard = () => setIsSelectingDiscard(false);
  const addFromDeckToHand = (card) =>
    apiDrawSpecificCard(gameGuid, card, hand, setHand, cardsInDeck, setCardsInDeck);
  const addFromDiscardToHand = (card) => {
    card.attachedCards = [];
    card.damageCounters = 0;
    setHand([...hand, card]);
    setDiscard(discard.filter((c) => c.numberInDeck != card.numberInDeck));
  };

  const tightenHandLayout = () =>
    tightenHandLayoutLogic(hand, setHand, setRerenderKey);

  // whenever cards move around, make sure we know the correct number of cards remaining in the deck
  useEffect(() => {
    let totalAttached = 0;
    bench.forEach((c) => (totalAttached += c.attachedCards.length));
    if (active) totalAttached += active.attachedCards.length;
    setNumberInDeck(
      60 -
        hand.length -
        bench.length -
        discard.length -
        prizes.length -
        (active ? 1 : 0) -
        totalAttached
    );
  }, [hand, active, bench, discard, prizes]);

  // on mount
  useEffect(() => {
    initializeGame(deckNumber, gameGuid, setHand, mulligans);
  }, []);

  return (
    <>
      {!gameGuid.current && <Loading />}

      {isSelectingDeck && (
        <Modal
          className="card-overlay-container"
          isOpen={isSelectingDeck}
          onRequestClose={handleCloseSelectFromDeck}
        >
          {cardsInDeck.map((card) => (
            <a
              href="#"
              key={"deckselect" + card.numberInDeck}
              onClick={() => addFromDeckToHand(card)}
            >
              <img src={`${card.image}/low.webp`} className="card-size" />
            </a>
          ))}
          <button onClick={handleCloseSelectFromDeck}>
            Done selecting cards
          </button>
        </Modal>
      )}

      {isSelectingDiscard && (
        <Modal
          className="card-overlay-container"
          isOpen={isSelectingDiscard}
          onRequestClose={handleCloseSelectFromDiscard}
        >
          {discard.map((card) => (
            <a
              href="#"
              key={"discardselect" + card.numberInDeck}
              onClick={() => addFromDiscardToHand(card)}
            >
              <img src={`${card.image}/low.webp`} className="card-size" />
            </a>
          ))}
          <button onClick={handleCloseSelectFromDiscard}>
            Done selecting cards
          </button>
        </Modal>
      )}

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
            handleDiscardHand={handleDiscardHand}
            handleSelectFromDeck={handleSelectFromDeck}
            handleShuffle={handleShuffle}
          />
          <button id="flip-coin-button" onClick={getCoinFlip}>flip coin</button>
          <button id="draw-card-button" onClick={drawTopCard}>draw</button>
          <button id="end-game-button" onClick={endGame}>end game</button>
        </>
      )}

      {coinResult != null && (
        <Modal
          className="coin-flip-container"
          isOpen={coinResult != null}
          onRequestClose={closeCoinFlip}
        >
          <CoinFlip isHeads={coinResult} />
        </Modal>
      )}
    </>
  );
};

export default Game;