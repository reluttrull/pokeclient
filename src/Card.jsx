import React, { useEffect, useRef, useState } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import { FaCircleInfo } from 'react-icons/fa6';
import Modal from 'react-modal';
import AttachedEnergy from './AttachedEnergy.jsx';
import Damage from './Damage.jsx';
import SpecialConditions from './SpecialConditions.jsx';
import './App.css';

const Card = ({data, startOffset, positionCallback}) => {
  const ref = useRef(null);
  const uuid = crypto.randomUUID();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [translateX, setTranslateX] = useValue(startOffset);
  const [translateY, setTranslateY] = useValue(0);
  const [attachedEnergy, setAttachedEnergy] = useState(data.attachedCards
          .filter((attachedCard) => attachedCard.category == "Energy")
          .toSorted((a,b) => a.name - b.name));
  const [mockEnergy, setMockEnergy] = useState(data.attachedCards
          .filter((attachedCard) => attachedCard.name == "Electrode"));
  const [rerenderEnergyKey, setRerenderEnergyKey] = useState(0);
  const [rerenderDmgKey, setRerenderDmgKey] = useState(0);

  let urlstring = `url('${data.image}/low.webp')`;
  let hqurlstring = `${data.image}/high.webp`;
  Modal.setAppElement('#root');
  const [backgroundImage, setBackgroundImage] = useValue(urlstring);
  const targets = [
    { left: 480, top: 470, position: -1}, // hand
    { left: 590, top: 470, position: -1}, // extend hand area right
    { left: 600, top: 115, position: 0 }, // active
    { left: 300, top: 315, position: 1 }, // bench 1
    { left: 450, top: 315, position: 2 }, // bench 2
    { left: 600, top: 315, position: 3 }, // bench 3
    { left: 750, top: 315, position: 4 }, // bench 4
    { left: 900, top: 315, position: 5 }, // bench 5
    { left: 1100, top: 485, position: 6 }, // discard
    { left: 1100, top: 310, position: 7 }, // deck
  ];
  
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useDrag(ref, ({ down, movement }) => {
    if (!ref.current) return;

    const scrollX = window.scrollX; // account for scroll
    const scrollY = window.scrollY;

    const scale = window.visualViewport?.scale ?? 1; // account for zoom

    const rect = ref.current.getBoundingClientRect();
    const cardCenterX = (rect.left + rect.width / 2) / scale + scrollX;
    const cardCenterY = (rect.top + rect.height / 2) / scale + scrollY;
    
    // see if we're on any target locations
    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      if (cardCenterX >= target.left - 55 && cardCenterX <= target.left + 55
          && cardCenterY >= target.top - 81 && cardCenterY <= target.top + 81) {
        setTranslateX(down ? movement.x : withSpring(target.left + 2));
        setTranslateY(down ? movement.y : withSpring(target.top)); 
        if (!down) {
          positionCallback({ card: data, pos: target.position});
          setTranslateX(withSpring(startOffset));
          setTranslateY(withSpring(0));
        }
        return;
      }
    }

    setTranslateX(down ? movement.x : withSpring(startOffset));
    setTranslateY(down ? movement.y : withSpring(0));
  });

  function handleDamageChange(change) {
    data.damageCounters += change;
    setRerenderDmgKey((p) => p + 1);
  }

  function handleEnergyDelete(cardName) {
    console.log(`deleting ${cardName} from this card`);
    let energyCard = null;
    for (let i = data.attachedCards.length - 1; i >= 0; i--) {
      if (data.attachedCards[i].name == cardName) {
        energyCard = data.attachedCards[i];
        data.attachedCards.splice(i, 1);
        break;
      }
    }
    if (energyCard) {
      positionCallback({ card: energyCard, pos: 6}); // send to discard
    }
    
    // make sure state updates
    setAttachedEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.category == "Energy")
          .toSorted((a,b) => a.name - b.name));
  }

  useEffect(() => {
    setAttachedEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.category == "Energy")
          .toSorted((a,b) => a.name - b.name));
    setMockEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.name == "Electrode"));
    setRerenderEnergyKey((p) => p + 1);
    }, [JSON.stringify(data.attachedCards)]);

  return (
    <>
    <animate.div
      key={uuid}
      ref={ref}
      style={{
        position: 'absolute',
        cursor: 'grab',
        translateX,
        translateY,
        width: 120,
        height: 165,
        backgroundImage,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 4,
        zIndex: 1000,
        userSelect: "none",
        touchAction: "none"
      }}
    />
    <animate.div
      style={{
        position: 'absolute',
        translateX,
        translateY,
      }}
    >
      <FaCircleInfo className="info-block" onClick={openModal} alt="see full card" title="see full card" />
      {attachedEnergy.length > 0 && 
          attachedEnergy.map((card, index) => (
        <AttachedEnergy key={card.numberInDeck} cardName={card.name} offset={index * 20} deleteCallback={handleEnergyDelete} />
      ))}
      {mockEnergy.length > 0 &&
          mockEnergy.map((card, index) => (
        <div key={`${card.numberInDeck}-${rerenderEnergyKey}`}>
          <AttachedEnergy cardName={card.name} 
              offset={(attachedEnergy.length * 20) + (index * 40)} deleteCallback={handleEnergyDelete} />
          <AttachedEnergy cardName={card.name} 
              offset={(attachedEnergy.length * 20) + (index * 40) + 20} deleteCallback={handleEnergyDelete} />
        </div>
      ))}
      {data.category == "Pokemon" && <Damage key={`${data.numberInDeck}-dmg${rerenderDmgKey}`} damageCounters={data.damageCounters} damageCallback={handleDamageChange} />}
      {data.category == "Pokemon" && <SpecialConditions />}
    </animate.div>
    <Modal className="card-overlay-container"
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Card Overlay"
        onClick={closeModal}
      ><img className="card-overlay" src={hqurlstring} />
    </Modal>
    </>
  );
};

export default Card;
