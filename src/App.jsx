import React, { useRef } from 'react';
import Card from './Card.jsx';
import './App.css';

const App = () => {

  return (
    <>
    <div id="user-active"></div>
    <div id="user-bench-1"></div>
    <div id="user-bench-2"></div>
    <div id="user-bench-3"></div>
    <div id="user-bench-4"></div>
    <div id="user-bench-5"></div>
    <Card />
    <Card />
    <Card />
    <Card />
    <Card />
    <Card />
    </>
  );
};

export default App;
