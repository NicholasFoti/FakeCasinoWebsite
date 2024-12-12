import React, { useState } from 'react';
import './Blackjack.css';

const Blackjack = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [deck, setDeck] = useState([]);


  const startGame = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);
    console.log(shuffledDeck);
    // Initialize hands and set game status to 'playing'
    setPlayerHand(shuffledDeck.slice(0, 2));
    setDealerHand(shuffledDeck.slice(2, 4));
    setGameStatus('playing');
  };

  const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return suits.flatMap(suit => numbers.map(number => number + suit));
  };

  const shuffleDeck = (newDeck) => {
    const shuffledDeck = [...newDeck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  };

  // Logic for player to draw a card
  const hit = () => {
    const newPlayerHand = [...playerHand, deck.pop()];
    setPlayerHand(newPlayerHand);
    if (calculateHandValue(newPlayerHand) > 21) {
      setGameStatus('lost');
    }
  };

  // Logic for dealer to draw a card
  const stand = () => {
    setGameStatus('stand');
    const newDealerHand = [...dealerHand, deck.pop()];
    setDealerHand(newDealerHand);
    if (calculateHandValue(newDealerHand) > 21) {
      setGameStatus('won');
    }
  };

  const calculateHandValue = (hand) => {
    const cardValues = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 10, 'Q': 10, 'K': 10, 'A': 11
    };

    let value = 0;
    let aceCount = 0;

    console.log(hand);

    hand.forEach(card => {
      const number = card.slice(0, -1);
      value += cardValues[number];
      if (number === 'A') aceCount += 1;
    });

    // Logic to handle aces as 1s or 11s. Whatever is beneficial to the player.
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount -= 1;
    }

    return value;
  };

  return (
    <div className="blackjack">
      <h2>BlackJack Coming Soon</h2>
    </div>
  );
};

export default Blackjack; 