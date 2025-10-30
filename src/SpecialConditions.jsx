import React, { useState } from 'react';
import { GiPoisonBottle, GiNightSleep, GiElectricalCrescent } from 'react-icons/gi';
import { ImConfused } from 'react-icons/im';
import './App.css';

const SpecialConditions = ({conditions, conditionsCallback}) => {
    const [isPoisoned, setIsPoisoned] = useState(false);
    const [isAsleep, setIsAsleep] = useState(false);
    const [isParalyzed, setIsParalyzed] = useState(false);
    const [isConfused, setIsConfused] = useState(false);

  return (
    <>
        <GiPoisonBottle onClick={() => setIsPoisoned(!isPoisoned)}
            class={isPoisoned ? "poisoned active-condition" : "poisoned inactive-condition"} />
        <GiNightSleep onClick={() => setIsAsleep(!isAsleep)}
            class={isAsleep ? "asleep active-condition" : "asleep inactive-condition"} />
        <GiElectricalCrescent onClick={() => setIsParalyzed(!isParalyzed)}
            class={isParalyzed ? "paralyzed active-condition" : "paralyzed inactive-condition"} />
        <ImConfused onClick={() => setIsConfused(!isConfused)}
            class={isConfused ? "confused active-condition" : "confused inactive-condition"} />
    </>
  );
};

export default SpecialConditions;