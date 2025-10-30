import React, { useRef } from 'react';
import { animate, useValue } from 'react-ui-animate';
import './App.css';

const CoinFlip = ({isHeads}) => {
  const [animation, setAnimation] = useValue("");

  if (isHeads) {
    setTimeout(function () {
      setAnimation("spin-heads 3s forwards");
      }, 100);
  } else {
    setTimeout(function () {
        setAnimation("spin-tails 3s forwards");
    }, 100);
  }

  return (
    <>
    <animate.div className="coin" id="coin" style={{ animation }}>
        <div className="heads">
            <img src="/pokeclient/coinHeads.png"/>
        </div>
        <div className="tails">
            <img src="/pokeclient/coinTails.png"/>
        </div>
    </animate.div>
    </>
  );
};

export default CoinFlip;