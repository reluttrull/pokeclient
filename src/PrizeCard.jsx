import React, { useRef } from 'react';
import { useValue } from 'react-ui-animate';
import './App.css';

const PrizeCard = ({prizeNum}) => {
  const ref = useRef(null);
  const regionX = 1000;
  const regionY = 100;
  const offsetX = (prizeNum % 2) * 95 + regionX;
  const offsetY = (prizeNum % 3) * 140 + regionY;
//   const [translateX, setTranslateX] = useValue(regionX + offsetX);
//   const [translateY, setTranslateY] = useValue(regionY + offsetY);

  let urlstring = `url('/cardback.png')`;
//   const [backgroundImage, setBackgroundImage] = useValue(urlstring);

  return (
    <>
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: offsetX,
        top: offsetY,
        width: 95,
        height: 140,
        backgroundImage : `url('/cardback.png')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 4,
      }}
    />
    </>
  );
};

export default PrizeCard;
