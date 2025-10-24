import React, { useState } from 'react';
import { FaCirclePlus, FaCircleMinus } from 'react-icons/fa6';
import './App.css';

const Damage = ({damageCounters, damageCallback}) => {
  const [displayDamageCounters, setDisplayDamageCounters] = useState(damageCounters);

  function changeDamage(change) {
    if (change < 0 && damageCounters == 0) return;
    setDisplayDamageCounters(displayDamageCounters + change);
    damageCallback(change);
  }

  return (
    <>
    <FaCirclePlus style={{position: 'absolute', top: '0px', left: '100px' }} onClick={() => changeDamage(1)} />
    <div style={{position: 'absolute', top: '20px', left: '105px' }}>DMG {displayDamageCounters * 10}</div>
    <FaCircleMinus style={{position: 'absolute', top: '70px', left: '100px' }} onClick={() => changeDamage(-1)} />
    </>
  );
};

export default Damage;