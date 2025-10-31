import React from 'react';
import { animate, useValue } from 'react-ui-animate';
import './App.css';

const StaticCard = ({data}) => {
  const uuid = crypto.randomUUID();

  let urlstring = `url('${data.image}/low.webp')`;
  const [backgroundImage, setBackgroundImage] = useValue(urlstring);

  return (
    <>
    <animate.div
      key={uuid}
      style={{
        position: 'absolute',
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
    </>
  );
};

export default StaticCard;