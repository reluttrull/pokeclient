import React, { useEffect, useState } from 'react';
import { FaCirclePlus, FaCircleMinus } from 'react-icons/fa6';
import './App.css';

const Damage = ({damageCounters, damageCallback}) => {
  const [displayDamageCounters, setDisplayDamageCounters] = useState(damageCounters);

  function changeDamage(change) {
    if (change < 0 && damageCounters == 0) return;
    damageCallback(change);
  }

  useEffect(() => {
    setDisplayDamageCounters(damageCounters);
  }, [damageCounters]);

  return (
    <>
    <FaCirclePlus id="add-damage-counter-button" onClick={() => changeDamage(1)} />
    <div id="damage-display">{displayDamageCounters * 10}</div>
    <FaCircleMinus id="remove-damage-counter-button" onClick={() => changeDamage(-1)} />
    </>
  );
};

export default Damage;