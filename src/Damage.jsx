import React, { useRef } from 'react';
import { animate, useValue } from 'react-ui-animate';
import './App.css';

const Damage = ({cardName, offset}) => {
  const [damageCounters, setDamageCounters] = useState(0);
  const [top, setTop] = useValue(offset + 20);
  let energyType = cardName.replace(" Energy", "");

  let urlstring = `/${energyType}.png`;

  console.log(left);

  return (
    <div></div>
  );
};

export default Damage;