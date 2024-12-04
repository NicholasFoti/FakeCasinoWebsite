import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="main-card">
      <h2>Welcome to Fake Casino</h2>
      <h2>Choose Your Game</h2>
      <div className="main-card-buttons">
        <div className="game-card">
          <h3 className="game-title">Roulette</h3>
          <p className="game-description">
            Place your bets and watch the wheel spin! Win up to 14x your bet in this classic casino game.
          </p>
          <Link to="/roulette">
            <button className="play-button">Play Now</button>
          </Link>
        </div>
        
        <div className="game-card">
          <h3 className="game-title">Blackjack</h3>
          <p className="game-description">
            Test your luck against the dealer in this strategic card game. Get as close to 21 as you can!
          </p>
          <Link to="/blackjack">
            <button className="play-button">Play Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 