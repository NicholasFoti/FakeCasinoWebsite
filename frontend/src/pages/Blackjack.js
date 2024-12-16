import React, { useState, useEffect } from 'react';
import {
  handleClearBet,
  handlePlusOne,
  handlePlusTen,
  handlePlusOneHundred,
  handlePlusOneThousand,
  handleHalf,
  handleDouble,
  handleMax
} from '../utils/wager';
import { updateWinnings, updateBalance, updateBetStats } from "../utils/winnings";
import './Blackjack.css';

const Blackjack = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [betAmount, setBetAmount] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [deck, setDeck] = useState([]);
  const [isBetProcessing, setIsBetProcessing] = useState(false);


  const startGame = () => {
    const userToken = localStorage.getItem('token');
    if (!userToken){
      alert('Please login to place a bet');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const wager = document.querySelector('.blackjack-wager-input input').value;

    handleBet(wager, user)
  };

  const beginHand = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);

    // Initialize hands and set game status to 'playing'
    setPlayerHand(shuffledDeck.slice(0, 2));
    setDealerHand(shuffledDeck.slice(2, 4));
    setGameStatus('playing');
  };

  const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return suits.flatMap(suit => numbers.map(number => `${number}${suit}`));
  };

  //Shuffle the deck before play
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
      setGameStatus('bust');
    }
  };

  // Logic for the dealer's turn after the player stands
  const stand = () => {
    setGameStatus('stand');

    let dealerCurrentHand = [...dealerHand];
    let dealerValue = calculateHandValue(dealerCurrentHand);
    const playerValue = calculateHandValue(playerHand);

    // Early check: if player already has Blackjack, they automatically win
    if (playerValue === 21) {
      setGameStatus('blackjack');
      updateBalance(betAmount * 2);
      return;
    }

    const revealInterval = setInterval(() => {
      dealerValue = calculateHandValue(dealerCurrentHand);
      console.log('Dealer’s Value:', dealerValue);

      if (dealerValue < 17) {
        dealerCurrentHand.push(deck.pop());
        setDealerHand([...dealerCurrentHand]);
      } else {
        // Dealer stands at 17 or more
        clearInterval(revealInterval);

        if (dealerValue > 21) {
          // Dealer busts, player wins
          setGameStatus('won');
          updateBalance(betAmount * 2);
        } else if (dealerValue > playerValue) {
          // Dealer has higher total (21 or less), dealer wins
          setGameStatus('lost');
        } else if (dealerValue < playerValue) {
          // Player has higher total, player wins
          setGameStatus('won');
          updateBalance(betAmount * 2);
        } else {
          // Tie
          setGameStatus('draw');
          updateBalance(betAmount);
        }
      }
    }, 1000);
  };

  const calculateHandValue = (hand) => {
    const cardValues = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 10, 'Q': 10, 'K': 10, 'A': 11
    };

    let value = 0;
    let aceCount = 0;

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

  async function handleBet(amount, user){

    setIsBetProcessing(true);

    const betButton = document.querySelector('.blackjack-play-button')
    if (betButton.dataset.betting === 'true') {
      return;
    }

    betButton.dataset.betting = 'true';

    if (amount <= 0){
      alert('Please Enter a Valid Bet');
      betButton.dataset.betting = 'false';
      return;
    }

    if (amount > user.balance){
      alert('You dont have enough balance');
      betButton.dataset.betting = 'false';
      return;
    }

    try {
      // Update balance in database
      await updateBalance(-amount);
      
      // Update local balance
      const updatedBalance = Number((user.balance - amount).toFixed(2));
      user.balance = updatedBalance;
      localStorage.setItem('user', JSON.stringify(user));

      window.dispatchEvent(new Event('balanceUpdate'));
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      betButton.dataset.betting = 'false';
      setIsBetProcessing(false);
    }

    setBetAmount(parseFloat(amount));
    beginHand(amount);
  };

  useEffect(() => {
    window.isBetProcessing = isBetProcessing;
    return () => {
      window.isBetProcessing = false;
    };
  }, [isBetProcessing]);

  return (
    <div className="main-card">
      <h2>Blackjack (In Development)</h2>
      <div className="player-cards">
        {playerHand.map((card, index) => (
          <span key={index}>{card}</span>
        ))}
      </div>
      <div className="dealer-cards">
        {gameStatus !== 'playing' ? dealerHand.map((card, index) => (
          <span key={index}>{card}</span>
        )) : <span key={0}>{dealerHand[0]}</span>}
      </div>
      {gameStatus === 'bust' || gameStatus === 'lost' || gameStatus === 'won' || gameStatus === 'blackjack' || gameStatus === 'draw' ? (
        <div>
          <p>{gameStatus === 'bust' ? 'Bust!' : gameStatus === 'lost' ? 'You Lost!' : gameStatus === 'won' ? 'You Won!' : gameStatus === 'blackjack' ? 'Blackjack!' : 'Draw! Original Bet Returned'}</p>
          <button className="blackjack-play-again" onClick={() => {
            setGameStatus('waiting');
            setPlayerHand([]);
            setDealerHand([]);
          }}>Play Again</button>
        </div>
      ) : (
        <div className="button-container">
          {gameStatus === 'waiting' ? (
            <>
              <button className="blackjack-play-button" onClick={startGame}>Play</button>
              <div className="wager">
                <h2>Wager:</h2>
                <div className="wager-input blackjack-wager-input">
                  <input type="number" placeholder="Enter your wager" />
                  <button className="blackjack-wager-button clear" onClick={handleClearBet}>Clear</button>
                  <button className="blackjack-wager-button +1" onClick={handlePlusOne}>+1</button>
                  <button className="blackjack-wager-button +10" onClick={handlePlusTen}>+10</button>
                  <button className="blackjack-wager-button +100" onClick={handlePlusOneHundred}>+100</button>
                  <button className="blackjack-wager-button +1000" onClick={handlePlusOneThousand}>+1000</button>
                  <button className="blackjack-wager-button 1/2" onClick={handleHalf}>1/2</button>
                  <button className="blackjack-wager-button 2x" onClick={handleDouble}>2x</button>
                  <button className="blackjack-wager-button max" onClick={handleMax}>Max</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button className="blackjack-hit-button" onClick={hit}>Hit</button>
              <button className="blackjack-stand-button" onClick={stand}>Stand</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Blackjack; 