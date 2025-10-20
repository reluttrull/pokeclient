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
    USERACTIVELEFT: 550,
    USERACTIVETOP: 165,
    USERBENCH1LEFT: 250,
    USERBENCH1TOP: 465,
    USERBENCH2LEFT: 400,
    USERBENCH2TOP: 465,
    USERBENCH3LEFT: 550,
    USERBENCH3TOP: 465,
    USERBENCH4LEFT: 700,
    USERBENCH4TOP: 465,
    USERBENCH5LEFT: 850,
    USERBENCH5TOP: 465,
    DISCARDPILELEFT: 1100,
    DISCARDPILETOP: 485,
  }
  
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useDrag(ref, ({ down, movement }) => { // TODO: refactor this mess
    //console.log(movement);
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    //console.log(cardCenterX, cardCenterY);
    // active
    if (cardCenterX >= Targets.USERACTIVELEFT - 50 && cardCenterX <= Targets.USERACTIVELEFT + 50
        && cardCenterY >= Targets.USERACTIVETOP - 70 && cardCenterY <= Targets.USERACTIVETOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERACTIVELEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERACTIVETOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 0});
      return;
    }
    // bench 1
    if (cardCenterX >= Targets.USERBENCH1LEFT - 50 && cardCenterX <= Targets.USERBENCH1LEFT + 50
        && cardCenterY >= Targets.USERBENCH1TOP - 70 && cardCenterY <= Targets.USERBENCH1TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH1LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH1TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 1});
      return;
    }
    // bench 2
    if (cardCenterX >= Targets.USERBENCH2LEFT - 50 && cardCenterX <= Targets.USERBENCH2LEFT + 50
        && cardCenterY >= Targets.USERBENCH2TOP - 70 && cardCenterY <= Targets.USERBENCH2TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH2LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH2TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 2});
      return;
    }
    // bench 3
    if (cardCenterX >= Targets.USERBENCH3LEFT - 50 && cardCenterX <= Targets.USERBENCH3LEFT + 50
        && cardCenterY >= Targets.USERBENCH3TOP - 70 && cardCenterY <= Targets.USERBENCH3TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH3LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH3TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 3});
      return;
    }
    // bench 4
    if (cardCenterX >= Targets.USERBENCH4LEFT - 50 && cardCenterX <= Targets.USERBENCH4LEFT + 50
        && cardCenterY >= Targets.USERBENCH4TOP - 70 && cardCenterY <= Targets.USERBENCH4TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH4LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH4TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 4});
      return;
    }
    // bench 5
    if (cardCenterX >= Targets.USERBENCH5LEFT - 50 && cardCenterX <= Targets.USERBENCH5LEFT + 50
        && cardCenterY >= Targets.USERBENCH5TOP - 70 && cardCenterY <= Targets.USERBENCH5TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH5LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH5TOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 5});
      return;
    }
    // discard
    if (cardCenterX >= Targets.DISCARDPILELEFT - 50 && cardCenterX <= Targets.DISCARDPILELEFT + 50
        && cardCenterY >= Targets.DISCARDPILETOP - 70 && cardCenterY <= Targets.DISCARDPILETOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.DISCARDPILELEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.DISCARDPILETOP)); 
      if (!down) positionCallback({ num: data.numberInDeck, pos: 6});
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
