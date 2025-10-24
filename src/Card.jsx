import React, { useRef } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import { FaCircleInfo } from 'react-icons/fa6';
import Modal from 'react-modal';
import AttachedEnergy from './AttachedEnergy.jsx';
import Damage from './Damage.jsx';
import './App.css';

const Card = ({data, startOffset, positionCallback}) => {
  const ref = useRef(null);
  const uuid = crypto.randomUUID();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [translateX, setTranslateX] = useValue(startOffset);
  const [translateY, setTranslateY] = useValue(0);

  let urlstring = `url('${data.image}/low.webp')`;
  let hqurlstring = `${data.image}/high.webp`;
  Modal.setAppElement('#root');
  const [backgroundImage, setBackgroundImage] = useValue(urlstring);
  const targets = [
    { left: 550, top: 165, position: 0 }, // active
    { left: 250, top: 465, position: 1 }, // bench 1
    { left: 400, top: 465, position: 2 }, // bench 2
    { left: 550, top: 465, position: 3 }, // bench 3
    { left: 700, top: 465, position: 4 }, // bench 4
    { left: 850, top: 465, position: 5 }, // bench 5
    { left: 1100, top: 485, position: 6 }, // discard
  ];
  
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useDrag(ref, ({ down, movement }) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    
    // see if we're on any target locations
    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      if (cardCenterX >= target.left - 50 && cardCenterX <= target.left + 50
          && cardCenterY >= target.top - 70 && cardCenterY <= target.top + 70) {
        setTranslateX(down ? movement.x : withSpring(target.left + 2));
        setTranslateY(down ? movement.y : withSpring(target.top)); 
        if (!down) {
          positionCallback({ num: data.numberInDeck, pos: target.position});
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
  }

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
        width: 95,
        height: 140,
        backgroundImage,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 4,
        zIndex: 1000
      }}
    />
    <animate.div
      style={{
        position: 'absolute',
        translateX,
        translateY,
      }}
    >
      <FaCircleInfo className="info-block" onClick={openModal} />
      {data.attachedCards.filter((attachedCard) => attachedCard.category == "Energy") // only energy cards
          .toSorted((a,b) => a.name - b.name) // TODO: make sure they group together
          .map((card, index) => (
        <AttachedEnergy key={card.numberInDeck} cardName={card.name} offset={index * 20} />
      ))}
      {data.category == "Pokemon" && <Damage damageCounters={data.damageCounters} damageCallback={handleDamageChange} />}
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
