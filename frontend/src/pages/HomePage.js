import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="game-list">
      <h2>Our Games</h2>
      <Link to="/roulette"><div className="roulette">
        <h2>Roulette</h2>
        <p>Spin the wheel and try your luck!</p>
      </div></Link>
      <Link to="/blackjack"><div className="blackjack">
        <h2>Blackjack</h2>
        <p>Play the classic card game!</p>
      </div></Link>
      <Link to="/slots"><div className="slots">
        <h2>Slots</h2>
        <p>Spin the reels and try your luck!</p>
      </div></Link>
    </div>
  );
};

export default HomePage; 