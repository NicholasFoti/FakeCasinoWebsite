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
import Chat from '../components/Chat';
import { updateWinnings, updateBalance, updateBetStats, addRecentBet } from "../utils/winnings";
import './Blackjack.css';
import Card from '../components/Card';

const Blackjack = () => {
  const [playerHand, setPlayerHand] = useState(() => {
    const saved = localStorage.getItem('blackjack_playerHand');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [dealerHand, setDealerHand] = useState(() => {
    const saved = localStorage.getItem('blackjack_dealerHand');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [deck, setDeck] = useState(() => {
    const saved = localStorage.getItem('blackjack_deck');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [gameStatus, setGameStatus] = useState(() => {
    const saved = localStorage.getItem('blackjack_gameStatus');
    return saved || 'waiting';
  });
  
  const [betAmount, setBetAmount] = useState(() => {
    const saved = localStorage.getItem('blackjack_betAmount');
    return saved ? parseFloat(saved) : 0;
  });

  const [isBetProcessing, setIsBetProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('blackjack_playerHand', JSON.stringify(playerHand));
  }, [playerHand]);

  useEffect(() => {
    localStorage.setItem('blackjack_dealerHand', JSON.stringify(dealerHand));
  }, [dealerHand]);

  useEffect(() => {
    localStorage.setItem('blackjack_deck', JSON.stringify(deck));
  }, [deck]);

  useEffect(() => {
    localStorage.setItem('blackjack_gameStatus', gameStatus);
  }, [gameStatus]);

  useEffect(() => {
    localStorage.setItem('blackjack_betAmount', betAmount);
  }, [betAmount]);

  const clearGameState = () => {
    localStorage.removeItem('blackjack_playerHand');
    localStorage.removeItem('blackjack_dealerHand');
    localStorage.removeItem('blackjack_deck');
    localStorage.removeItem('blackjack_gameStatus');
    localStorage.removeItem('blackjack_betAmount');
    localStorage.removeItem('blackjack_current_game');
  };

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

    // Initialize hands
    const initialPlayerHand = shuffledDeck.slice(0, 2);
    const initialDealerHand = shuffledDeck.slice(2, 4);
    
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);

    // Check for blackjack
    if (calculateHandValue(initialPlayerHand) === 21) {
      setGameStatus('blackjack');
    } else {
      setGameStatus('playing');
    }
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

    // Add delay to show card flip animation
    setTimeout(() => {
      let dealerCurrentHand = [...dealerHand];
      let dealerValue = calculateHandValue(dealerCurrentHand);
      const playerValue = calculateHandValue(playerHand);

      let won = false;

      // Early check: if player already has Blackjack, they automatically win
      if (playerValue === 21) {
        setGameStatus('blackjack');
        won = true;
        return;
      }

      const revealInterval = setInterval(() => {
        dealerValue = calculateHandValue(dealerCurrentHand);
        console.log('Dealers Value:', dealerValue);

        if (dealerValue < 17) {
          dealerCurrentHand.push(deck.pop());
          setDealerHand([...dealerCurrentHand]);
        } else {
          clearInterval(revealInterval);
          
          if (dealerValue > 21) {
            setGameStatus('won');
            won = true;
          } else if (dealerValue > playerValue) {
            setGameStatus('lost');
            won = false;
          } else if (dealerValue < playerValue) {
            setGameStatus('won');
            won = true;
          } else {
            setGameStatus('draw');
            updateBalance(betAmount);
            window.dispatchEvent(new Event('balanceUpdate'));
          }
        }
      }, 1000);
    }, 600); // Wait for card flip animation to complete
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

    // Refresh user data right before checking balance
    const updatedUserData = JSON.parse(localStorage.getItem('user'));
    const numericAmount = Number(amount);
    const numericBalance = Number(updatedUserData.balance);

    if (numericAmount > numericBalance) {
      alert('You dont have enough balance');
      betButton.dataset.betting = 'false';
      return;
    }

    let betSuccessful = false;
    try {
      // Update balance in database
      await updateBalance(-amount);
      
      // Update the user's balance locally
      updatedUserData.balance = Number((updatedUserData.balance - amount).toFixed(2));
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      window.dispatchEvent(new Event('balanceUpdate'));
      betSuccessful = true;
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      betButton.dataset.betting = 'false';
      setIsBetProcessing(false);
    }

    if (betSuccessful) {
      setBetAmount(parseFloat(amount));
      beginHand(amount);
    }
  };

  useEffect(() => {
    window.isBetProcessing = isBetProcessing;
    return () => {
      window.isBetProcessing = false;
    };
  }, [isBetProcessing]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (gameStatus === 'bust' || gameStatus === 'lost' || gameStatus === 'won' || gameStatus === 'blackjack' || gameStatus === 'draw') {
      const handleGameOutcome = () => {
        const gameId = localStorage.getItem('blackjack_current_game');
        if (gameId) return Promise.resolve();

        const newGameId = Date.now().toString();
        localStorage.setItem('blackjack_current_game', newGameId);
        
        const won = gameStatus === 'won' || gameStatus === 'blackjack';
        const isDraw = gameStatus === 'draw';

        const promises = [
          updateBetStats(won),
          updateWinnings(won ? betAmount * 2 : 0, won ? 0 : betAmount),
          addRecentBet('Blackjack', betAmount, won ? betAmount * 2 : (isDraw ? 0 : -betAmount), won)
        ];

        // Only add balance update for wins
        if (won) {
          promises.unshift(updateBalance(betAmount * 2));
        }

        return Promise.all(promises)
          .then(() => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (won) {
              user.balance = parseFloat(user.balance) + (betAmount * 2);
              user.balance = user.balance.toFixed(2);
              localStorage.setItem('user', JSON.stringify(user));
            }
            window.dispatchEvent(new Event('balanceUpdate'));
          })
          .catch(error => console.error('Error handling game outcome:', error));
      };
      handleGameOutcome();
    }
  }, [gameStatus, betAmount]);

  return (
    <div className="blackjack-page">
      <Chat />
      <div className="blackjack-main-card">
        <h2>Blackjack</h2>
      {gameStatus !== 'waiting' && (
        <>
        <div className="game-area">
          <div className="player-cards">
            <p>Your Hand: <span>{calculateHandValue(playerHand)}</span></p>
            <div className="cards-row">
              {playerHand.map((card, index) => (
                <Card key={index} card={card} />
              ))}
            </div>
          </div>
          <div className="dealer-cards">
            <p>Dealers Hand: <span>{gameStatus !== 'playing' ? calculateHandValue(dealerHand) : calculateHandValue(dealerHand.slice(0, 1))}</span></p>
            <div className="cards-row">
              {dealerHand.map((card, index) => (
                <Card 
                  key={index} 
                  card={card} 
                  isHidden={gameStatus === 'playing' && index === 1}
                />
              ))}
            </div>
          </div>
        </div>
        </>
      )}
      {gameStatus === 'bust' || gameStatus === 'lost' || gameStatus === 'won' || gameStatus === 'blackjack' || gameStatus === 'draw' ? (
        <div>
          <p>{gameStatus === 'bust' ? 'Bust!' : gameStatus === 'lost' ? 'You Lost!' : gameStatus === 'won' ? 'You Won!' : gameStatus === 'blackjack' ? 'Blackjack!' : 'Draw! Original Bet Returned'}</p>
          <button className="blackjack-play-again" onClick={() => {
            setGameStatus('waiting');
            setPlayerHand([]);
            setDealerHand([]);
            setDeck([]);
            clearGameState();
          }}>Play Again</button>
        </div>
      ) : (
        <div className="button-container">
          {gameStatus === 'waiting' ? (
            <>
              <button className="blackjack-play-button" onClick={startGame}>Play</button>
              <div className="wager blackjack">
                <h2>Wager:</h2>
                <div className="wager-input blackjack-wager-input">
                  <input type="number" placeholder="Enter your wager" />
                  <button className="wager-button clear" onClick={handleClearBet}>Clear</button>
                  <button className="wager-button +1" onClick={handlePlusOne}>+1</button>
                  <button className="wager-button +10" onClick={handlePlusTen}>+10</button>
                  <button className="wager-button +100" onClick={handlePlusOneHundred}>+100</button>
                  <button className="wager-button +1000" onClick={handlePlusOneThousand}>+1000</button>
                  <button className="wager-button 1/2" onClick={handleHalf}>1/2</button>
                  <button className="wager-button 2x" onClick={handleDouble}>2x</button>
                  <button className="wager-button max" onClick={handleMax}>Max</button>
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
    </div>
  );
};

export default Blackjack; 