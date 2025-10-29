import React, { useRef } from 'react';
import { animate, useValue } from 'react-ui-animate';
import confirm from './ConfirmationDialog.jsx';
import './App.css';

const AttachedEnergy = ({cardName, offset, deleteCallback}) => {
  console.log(cardName);
  const [left, setLeft] = useValue(offset + 20);
  let energyType = cardName.replace(" Energy", "");

  let urlstring = `/${energyType}.png`;

  console.log(left);

  const handleEnergyClick = async () => {
    if (await confirm({ confirmation: 'Do you really want to delete this energy?' })) {
      deleteCallback(cardName);
    }
  };

  return (
    <animate.div className="energy-icon" onClick={handleEnergyClick} style={{left}}>
        <img src={urlstring} />
    </animate.div>
  );
};

export default AttachedEnergy;