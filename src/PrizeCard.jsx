import React, { useRef } from 'react';
import './App.css';

const PrizeCard = ({prizeNum}) => {
  const ref = useRef(null);
  const regionX = 10;
  const regionY = 10;
  const offsetX = (prizeNum % 2) * 95 + regionX;
  const offsetY = (prizeNum % 3) * 100 + regionY;

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
