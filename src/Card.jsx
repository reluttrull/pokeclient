import React, { useRef } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import './App.css';

const Card = () => {
  const ref = useRef(null);
  const [translateX, setTranslateX] = useValue(0);
  const [translateY, setTranslateY] = useValue(0);
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

  useDrag(ref, ({ down, movement }) => {
    //console.log(movement);
    // active
    if (movement.x >= Targets.USERACTIVELEFT - 50 && movement.x <= Targets.USERACTIVELEFT + 50
        && movement.y >= Targets.USERACTIVETOP - 70 && movement.y <= Targets.USERACTIVETOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERACTIVELEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERACTIVETOP)); 
      return;
    }
    // bench 1
    if (movement.x >= Targets.USERBENCH1LEFT - 50 && movement.x <= Targets.USERBENCH1LEFT + 50
        && movement.y >= Targets.USERBENCH1TOP - 70 && movement.y <= Targets.USERBENCH1TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH1LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH1TOP)); 
      return;
    }
    // bench 2
    if (movement.x >= Targets.USERBENCH2LEFT - 50 && movement.x <= Targets.USERBENCH2LEFT + 50
        && movement.y >= Targets.USERBENCH2TOP - 70 && movement.y <= Targets.USERBENCH2TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH2LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH2TOP)); 
      return;
    }
    // bench 3
    if (movement.x >= Targets.USERBENCH3LEFT - 50 && movement.x <= Targets.USERBENCH3LEFT + 50
        && movement.y >= Targets.USERBENCH3TOP - 70 && movement.y <= Targets.USERBENCH3TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH3LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH3TOP)); 
      return;
    }
    // bench 4
    if (movement.x >= Targets.USERBENCH4LEFT - 50 && movement.x <= Targets.USERBENCH4LEFT + 50
        && movement.y >= Targets.USERBENCH4TOP - 70 && movement.y <= Targets.USERBENCH4TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH4LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH4TOP)); 
      return;
    }
    // bench 5
    if (movement.x >= Targets.USERBENCH5LEFT - 50 && movement.x <= Targets.USERBENCH5LEFT + 50
        && movement.y >= Targets.USERBENCH5TOP - 70 && movement.y <= Targets.USERBENCH5TOP + 70) {
      setTranslateX(down ? movement.x : withSpring(Targets.USERBENCH5LEFT + 2));
      setTranslateY(down ? movement.y : withSpring(Targets.USERBENCH5TOP)); 
      return;
    }
    setTranslateX(down ? movement.x : withSpring(0));
    setTranslateY(down ? movement.y : withSpring(0));
  });

  return (
    <>
    <animate.div
      ref={ref}
      style={{
        position: 'absolute',
        cursor: 'grab',
        translateX,
        translateY,
        width: 95,
        height: 140,
        backgroundImage: `url('/testcards/bulba.png')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 4,
      }}
    />
    </>
  );
};

export default Card;
