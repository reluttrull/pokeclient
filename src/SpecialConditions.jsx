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
        <GiPoisonBottle onClick={() => setIsPoisoned(!isPoisoned)} alt="poison" title="poison"
            className={isPoisoned ? "poisoned icon-button active-condition" : "poisoned icon-button inactive-condition"} />
        <GiNightSleep onClick={() => setIsAsleep(!isAsleep)} alt="sleep" title="sleep"
            className={isAsleep ? "asleep icon-button active-condition" : "asleep icon-button inactive-condition"} />
        <GiElectricalCrescent onClick={() => setIsParalyzed(!isParalyzed)} alt="paralyze" title="paralyze"
            className={isParalyzed ? "paralyzed icon-button active-condition" : "paralyzed icon-button inactive-condition"} />
        <ImConfused onClick={() => setIsConfused(!isConfused)} alt="confuse" title="confuse"
            className={isConfused ? "confused icon-button active-condition" : "confused icon-button inactive-condition"} />
    </>
  );
};

export default SpecialConditions;