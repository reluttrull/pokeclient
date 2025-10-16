import React, { useRef } from 'react';
import Card from './Card.jsx';
import './App.css';
import baseset from './data/baseset.json';

const App = () => {

  function getRandomCard() {
    let rand = Math.floor(Math.random() * baseset.length);
    return baseset[rand];
  }

  return (
    <>
    <div id="user-active"></div>
    <div id="user-bench-1"></div>
    <div id="user-bench-2"></div>
    <div id="user-bench-3"></div>
    <div id="user-bench-4"></div>
    <div id="user-bench-5"></div>
    <Card data={getRandomCard()} startOffset={0} />
    <Card data={getRandomCard()} startOffset={20} />
    <Card data={getRandomCard()} startOffset={40} />
    <Card data={getRandomCard()} startOffset={60} />
    <Card data={getRandomCard()} startOffset={80} />
    <Card data={getRandomCard()} startOffset={100} />
    </>
  );
};

export default App;
