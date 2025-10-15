import React, { useRef } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import './App.css';

const App = () => {
  const ref = useRef(null);
  const [translateX, setTranslateX] = useValue(0);
  const [translateY, setTranslateY] = useValue(0);

  useDrag(ref, ({ down, movement }) => {
    console.log(movement);
    // active
    if (movement.x >= -262 && movement.x <= -162 && movement.y >= -133 && movement.y <= 47) {
      setTranslateX(down ? movement.x : withSpring(-214));
      setTranslateY(down ? movement.y : withSpring(-80)); 
      return;
    }
    setTranslateX(down ? movement.x : withSpring(0));
    setTranslateY(down ? movement.y : withSpring(0));
  });

  return (
    <>
    <div id="user-active"></div>
    <div id="user-bench-1"></div>
    <div id="user-bench-2"></div>
    <div id="user-bench-3"></div>
    <div id="user-bench-4"></div>
    <div id="user-bench-5"></div>
    <animate.div
      ref={ref}
      style={{
        cursor: 'grab',
        translateX,
        translateY,
        width: 95,
        height: 175,
        backgroundImage: `url('/testcards/bulba.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 4,
      }}
    />
    </>
  );
};

export default App;
