import React, { useRef } from 'react';
import { animate, useValue } from 'react-ui-animate';
import './App.css';

const AttachedEnergy = ({cardName, offset}) => {
  console.log(cardName);
  const [left, setLeft] = useValue(offset + 20);
  let energyType = cardName.split(" ")[0];

  let urlstring = `/${energyType}.png`;

  console.log(left);

  return (
    <animate.div className="energy-icon" style={{left}}>
        <img src={urlstring} />
    </animate.div>
  );
};

export default AttachedEnergy;
