import React from 'react';

const Card = ({ card }) => {
  const value = card.slice(0, -1);
  const suit = card.slice(-1);

  const getCardColor = (suitSymbol) => {
    return ['♥', '♦'].includes(suitSymbol) ? 'red-card' : 'black-card';
  };

  return (
    <div className="playing-card">
      <div className="card-inner">
        <div className={`card-front ${getCardColor(suit)}`}>
          <div className="card-top-left">
            {value}
            <div className="card-suit">{suit}</div>
          </div>
          <div className="card-center">{suit}</div>
          <div className="card-bottom-right">
            {value}
            <div className="card-suit">{suit}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;