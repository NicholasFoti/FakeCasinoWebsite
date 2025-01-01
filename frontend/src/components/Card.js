import React from 'react';

const Card = ({ card, isHidden }) => {
  const number = card.slice(0, -1);
  const suit = card.slice(-1);
  const isRed = suit === '♥' || suit === '♦';

  return (
    <div className="card-container">
      <div className={`playing-card ${isHidden ? 'flipped' : ''}`}>
        <div className={`card-front ${isRed ? 'red-card' : 'black-card'}`}>
          <div className="card-top-left">
            <div>{number}</div>
            <div className="card-suit">{suit}</div>
          </div>
          <div className="card-center">{suit}</div>
          <div className="card-bottom-right">
            <div>{number}</div>
            <div className="card-suit">{suit}</div>
          </div>
        </div>
        <div className="card-back">
          <div className="card-pattern"></div>
        </div>
      </div>
    </div>
  );
};

export default Card;