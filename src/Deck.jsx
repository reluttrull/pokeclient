import React, { useState } from 'react';
import './Shuffle.css';
import './App.css';

const Deck = ({shuffleCallback}) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const shuffle = document.getElementsByClassName('btn-shuffle')[0];

    function handleShuffle (event) {
        setIsAnimated(true);
        shuffleCallback();
        setTimeout(() => setIsAnimated(false), 5000);
    }

  return (
    <>
    <div className="card-wrapper card-target" id="deck">
        <div className={isAnimated ? "card-list is-animated" : "card-list"}>
            <div className="card-list__item" data-card="0">
                <img src="cardback.png" className="card-size" />
            </div>
            <div className="card-list__item" data-card="1">
                <img src="cardback.png" className="card-size" />
            </div>
            <div className="card-list__item" data-card="2">
                <img src="cardback.png" className="card-size" />
            </div>
        </div>
        <button className="button btn-shuffle" onClick={handleShuffle}>Shuffle</button>
    </div>
    </>
  );
};

export default Deck;
