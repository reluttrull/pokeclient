import React from 'react';
import { useValue, animate, withTiming, withSequence, withLoop } from 'react-ui-animate';
import './App.css';

const Loading = () => {
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });
  const energyImages = ['/pokeclient/Fighting.png', '/pokeclient/Lightning.png', '/pokeclient/Water.png', '/pokeclient/Colorless.png'];

  let index = Math.floor(Math.random() * energyImages.length);
  let url = energyImages[index];
  setObj(
    withLoop(
        withSequence([
            withTiming({ x: 100 }),
            withTiming({ y: 100 }),
            withTiming({ x: 0 }),
            withTiming({ y: 0 }),
        ]),
        10,
        {
            onStart() {
                console.log('loading animation started');
            }
        }
    )
);

  return (
    <>
      <animate.div
        style={{
          width: obj.width,
          height: 100,
          left: 0,
          top: 0,
          translateX: obj.x,
          translateY: obj.y,
          borderRadius: 4,
        }}><img src={url} style={{ width: '100px', height: '100px' }} /></animate.div>
    </>
  );
};

export default Loading;
