import React, { useRef } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import { FaCircleInfo } from 'react-icons/fa6';
import Modal from 'react-modal';
import './App.css';

const Card = ({data, startOffset, positionCallback}) => {
  const ref = useRef(null);
  const uuid = crypto.randomUUID();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [translateX, setTranslateX] = useValue(startOffset);
  const [translateY, setTranslateY] = useValue(0);

  let urlstring = `url('${data.image}/low.webp')`;
  let hqurlstring = `${data.image}/high.webp`;
  const [backgroundImage, setBackgroundImage] = useValue(urlstring);
  const Targets = {
    USERACTIVELEFT: 340,
    USERACTIVETOP: 70,
    USERBENCH1LEFT: 40,
    USERBENCH1TOP: 368,
    USERBENCH2LEFT: 190,
    USERBENCH2TOP: 368,
    USERBENCH3LEFT: 340,
    USERBENCH3TOP: 368,
    USERBENCH4LEFT: 490,
    USERBENCH4TOP: 368,
    USERBENCH5LEFT: 640,
    USERBENCH5TOP: 368,
  }
  
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useDrag(ref, ({ down, movement }) => {
    // active
    if (movement.x >= Targets.USERACTIVELEFT - 50 && movement.x <= Targets.USERACTIVELEFT + 50
        && movement.y >= Targets.USERACTIVETOP - 70 && movement.y <= Targets.USERACTIVETOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERACTIVELEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERACTIVETOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 0});
      return;
    }
    // bench 1
    if (movement.x >= Targets.USERBENCH1LEFT - 50 && movement.x <= Targets.USERBENCH1LEFT + 50
        && movement.y >= Targets.USERBENCH1TOP - 70 && movement.y <= Targets.USERBENCH1TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH1LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH1TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 1});
      return;
    }
    // bench 2
    if (movement.x >= Targets.USERBENCH2LEFT - 50 && movement.x <= Targets.USERBENCH2LEFT + 50
        && movement.y >= Targets.USERBENCH2TOP - 70 && movement.y <= Targets.USERBENCH2TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH2LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH2TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 2});
      return;
    }
    // bench 3
    if (movement.x >= Targets.USERBENCH3LEFT - 50 && movement.x <= Targets.USERBENCH3LEFT + 50
        && movement.y >= Targets.USERBENCH3TOP - 70 && movement.y <= Targets.USERBENCH3TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH3LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH3TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 3});
      return;
    }
    // bench 4
    if (movement.x >= Targets.USERBENCH4LEFT - 50 && movement.x <= Targets.USERBENCH4LEFT + 50
        && movement.y >= Targets.USERBENCH4TOP - 70 && movement.y <= Targets.USERBENCH4TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH4LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH4TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 4});
      return;
    }
    // bench 5
    if (movement.x >= Targets.USERBENCH5LEFT - 50 && movement.x <= Targets.USERBENCH5LEFT + 50
        && movement.y >= Targets.USERBENCH5TOP - 70 && movement.y <= Targets.USERBENCH5TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH5LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH5TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 5});
      return;
    }
    setTranslateX(down ? movement.x : withSpring(startOffset));
    setTranslateY(down ? movement.y : withSpring(0));
  });

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
