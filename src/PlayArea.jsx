// PlayArea.jsx
import React from 'react';
import { PiCardsThree } from 'react-icons/pi';
import Card from './Card.jsx';
import StaticCard from './StaticCard.jsx';
import PrizeCard from './PrizeCard.jsx';
import Deck from './Deck.jsx';
import './App.css';

const PlayArea = ({
  hand, bench, active, discard, prizes,
  numberInDeck, rerenderKey,
  cardCallback, tightenHandLayout,
  drawPrize, handleSelectFromDiscard, handleDiscardHand,
  handleSelectFromDeck, handleShuffle
}) => {
  return (
    <div>
      {/* Debug info */}
      <div style={{position: 'absolute', top: '50px', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
      <div style={{position: 'absolute', top: '100px', left: '700px', width: '200px'}}># cards in hand = {hand?.length}</div>
      <div style={{position: 'absolute', top: '150px', left: '700px', width: '200px'}}># cards in bench = {bench?.length}</div>

      {/* Active */}
      <div id="user-active" className="card-target">
        {active && <Card key={active.numberInDeck} data={active} startOffset={0} positionCallback={cardCallback} />}
      </div>

      {/* Bench */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} id={`user-bench-${i + 1}`} className="card-target">
          {bench.length > i && <Card key={bench[i].numberInDeck} data={bench[i]} startOffset={0} positionCallback={cardCallback} />}
        </div>
      ))}

      {/* Discard */}
      <div id="discard-area" className="card-target">
        <button id="discard-select-button" className="button" onClick={handleSelectFromDiscard}>
          Select from discard
        </button>
        <button id="discard-hand-button" className="button" onClick={handleDiscardHand}>Discard hand</button>
        {discard.length > 0 && (
          <StaticCard key={discard[0].numberInDeck} data={discard[0]} />
        )}
      </div>

      {/* Deck */}
      <Deck displayNum={numberInDeck} shuffleCallback={handleShuffle} selectCallback={handleSelectFromDeck} />

      {/* Prizes */}
      {prizes.map((prizeNum) => (
        <a href="#" key={prizeNum} onClick={() => drawPrize(prizeNum)}>
          <PrizeCard prizeNum={prizeNum} />
        </a>
      ))}

      {/* Hand */}
      <div id="hand-area" className="card-target">
        <PiCardsThree
          id="hand-tighten-button"
          className="icon-button"
          onClick={tightenHandLayout}
          alt="tighten up hand layout"
          title="tighten up hand layout"
        />
        {hand.map((card, index) => (
          <Card
            key={`${card.numberInDeck}-${rerenderKey}`}
            data={card}
            startOffset={index * 30}
            positionCallback={cardCallback}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayArea;