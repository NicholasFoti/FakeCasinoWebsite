import React, { useRef, useState, useEffect } from "react";
import { socket } from '../services/socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1Wave, faUser} from '@fortawesome/free-solid-svg-icons';
import winSound from '../sounds/money.mp3';
import Chat from '../components/Chat';
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
import { updateWinnings, updateBalance, updateBetStats, addRecentBet } from "../utils/winnings";


import "./Roulette.css";

function Roulette ({ setHideFooter }) {
  const [gameState, setGameState] = useState({
    countdown: 10,
    spinning: false,
    previousRolls: [],
    currentBets: {
      red: {},
      black: {},
      green: {}
    }
  });
  const numbersContainerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentWinAudio, setCurrentWinAudio] = useState(null);
  const [isBetProcessing, setIsBetProcessing] = useState(false);
  const globalVolumeRef = useRef(1);
  const spinVolumeRef = useRef(0.2);

  const baseNumbers = Array.from({ length: 37 }, (_, i) => ({
    value: i,
    color: i === 0 ? "green" : i % 2 === 0 ? "black" : "red",
  }));

  const numbers = [
    ...baseNumbers.slice(-5),
    ...Array(15).fill(null).flatMap(() => baseNumbers),
    ...baseNumbers.slice(0, 5),
  ];

  const calculateTargetOffset = (targetIndex, containerWidth) => {
    const numberWidth = 80;
    const totalNumbers = baseNumbers.length;
    const spins = 3;
    const dramaticMultiplier = [2.12, 2.19][Math.floor(Math.random() * 2)];

    if (window.innerWidth >= 2000) {
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 2) * dramaticMultiplier
      );
    }
    else if (window.innerWidth >= 1900) {
      const dramaticMultiplier = [2.6, 2.7][Math.floor(Math.random() * 2)];
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 2) * dramaticMultiplier
      );
    }
    else if (window.innerWidth >= 1600) {
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 3.34) * dramaticMultiplier
      );
    } else if (window.innerWidth >= 1450) {
      const dramaticMultiplier = [2.3, 2.4][Math.floor(Math.random() * 2)];
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 3.34) * dramaticMultiplier
      );
    }
    else if (window.innerWidth >= 1200) {
      const dramaticMultiplier = [2.7, 2.8][Math.floor(Math.random() * 2)];
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 3.34) * dramaticMultiplier
      );
    }
    else {
      const dramaticMultiplier = [2.9, 3][Math.floor(Math.random() * 2)];
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 3.34) * dramaticMultiplier
      );
    }
  };

  const spinToNumber = (targetNumber, elapsedTime = 0) => {
    const container = numbersContainerRef.current;
    if (!container) return;

    const countdownText = document.querySelector('.countdown-text');
    const countdownBar = document.querySelector('.countdown-bar');
    
    if (!countdownText || !countdownBar) return;

    const targetIndex = numbers.findIndex((num) => num.value === targetNumber);
    if (targetIndex === -1) return;

    const containerWidth = container.parentElement.offsetWidth;
    const targetOffset = calculateTargetOffset(targetIndex, containerWidth);

    if (elapsedTime > 0) {
      const progress = elapsedTime / 10000;
      const currentOffset = targetOffset * progress;
      
      container.style.transition = `transform ${10000 - elapsedTime}ms cubic-bezier(0.4, 0.0, 0.15, 0.999)`;
      container.style.transform = `translateX(-${targetOffset}px)`;
    } else {
      container.style.transition = "transform 10s cubic-bezier(0.4, 0.0, 0.15, 0.999)";
      container.style.transform = `translateX(-${targetOffset}px)`;
    }

    setGameState(prev => ({
      ...prev,
      spinning: true
    }));

    countdownText.textContent = `Rolling...`;

    setTimeout(() => {
      handleWinnings(targetNumber);
      handleBetResults(targetNumber);
    }, 10000);

    function handleBetResults(targetNumber) {
      if (targetNumber === 0) {
        document.querySelector('.total-betters-red').classList.add('losing-bet');
        document.querySelector('.total-betters-black').classList.add('losing-bet');
        document.querySelectorAll('.placed-red-name, .placed-black-name, .placed-red-amount, .placed-black-amount').forEach(el => el.classList.add('losing-bet'));
        document.querySelectorAll('.placed-green-name, .placed-green-amount').forEach(el => el.classList.add('winning-bet'));
        document.querySelector('.total-betters-green').classList.add('winning-bet');
      } else if (targetNumber % 2 === 0) {
        document.querySelector('.total-betters-red').classList.add('losing-bet');
        document.querySelector('.total-betters-green').classList.add('losing-bet');
        document.querySelectorAll('.placed-green-name, .placed-red-name, .placed-green-amount, .placed-red-amount').forEach(el => el.classList.add('losing-bet'));
        document.querySelectorAll('.placed-black-name, .placed-black-amount').forEach(el => el.classList.add('winning-bet'));
        document.querySelector('.total-betters-black').classList.add('winning-bet');
      } else {
        document.querySelector('.total-betters-black').classList.add('losing-bet');
        document.querySelector('.total-betters-green').classList.add('losing-bet');
        document.querySelectorAll('.placed-green-name, .placed-black-name, .placed-green-amount, .placed-black-amount').forEach(el => el.classList.add('losing-bet'));
        document.querySelectorAll('.placed-red-name, .placed-red-amount').forEach(el => el.classList.add('winning-bet'));
        document.querySelector('.total-betters-red').classList.add('winning-bet');
      }
    }

    setTimeout(() => {
      container.style.transition = "none";
      container.style.transform = "translateX(0px)";
      setGameState(prev => ({
        ...prev,
        spinning: false
      }));

      // Clear all bet entries and containers
      const colors = ['red', 'black', 'green'];
      colors.forEach(color => {
        const container = document.querySelector(`.placed-${color}`);
        if (container !== null) {
          container.innerHTML = '';
        }
      });

      const allBetElements = document.querySelectorAll('.placed-red-name, .placed-black-name, .placed-green-name, .placed-red-amount, .placed-black-amount, .placed-green-amount');
      allBetElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('winning-bet', 'losing-bet');
      });

      const totalPlaced = document.querySelectorAll('.total-placed-red span, .total-placed-black span, .total-placed-green span');
      totalPlaced.forEach(element => {
        element.textContent = '0';
      });

      const countdownBar = document.querySelector('.countdown-bar');
      countdownBar.style.transition = 'none';
      countdownBar.style.width = '100%';

      setGameState(prev => ({
        ...prev,
        currentBets: {
          red: {},
          black: {},
          green: {}
        }
      }));
      
      const totalBettersElements = document.querySelectorAll('.total-betters-red span, .total-betters-black span, .total-betters-green span');
      totalBettersElements.forEach(element => {
        element.textContent = '0';
      });

      const totalAmountElements = document.querySelectorAll('.total-amount-red span, .total-amount-black span, .total-amount-green span');
      totalAmountElements.forEach(element => {
        element.textContent = '0';
      });

      const allTotalBettersElements = document.querySelectorAll('.total-betters-red, .total-betters-black, .total-betters-green');
      allTotalBettersElements.forEach(element => {
        element.classList.remove('losing-bet', 'winning-bet');
      });

    }, 13000);
  };

  ///////////////////////////////
  //         SOUNDS            //
  ///////////////////////////////
  
  function playWinSound() {
    if (currentWinAudio) {
      currentWinAudio.pause();
      currentWinAudio.currentTime = 0;
    }
  
    const audio = new Audio(winSound);
    audio.volume = isMuted ? 0 : globalVolumeRef.current;
    
    // Add an event listener for when the sound ends
    audio.addEventListener('ended', () => {
      setCurrentWinAudio(null);
    });
    
    setCurrentWinAudio(audio);
    audio.play().catch(error => console.error('Error playing win sound:', error));
  }

  ///////////////////////////////
  //         WINNINGS          //
  ///////////////////////////////

  const handleWinnings = async (targetNumber) => {
    const allBetElements = document.querySelectorAll('.placed-red, .placed-black, .placed-green');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
  
    let userTotalBetAmount = 0;
    let userTotalWinAmount = 0;
  
    // Calculate user's total bets and winnings
    for (const container of allBetElements) {
      const nameElement = container.querySelector('[class*="-name"]');
      const amountElement = container.querySelector('[class*="-amount"]');
      
      if (!nameElement?.textContent || !amountElement?.textContent) continue;
      
      const betterName = nameElement.textContent.trim();
      const amount = parseFloat(amountElement.textContent);
      
      if (!betterName || !amount || betterName !== user.username) continue;
  
      userTotalBetAmount += amount;
  
      let won = false;
      let winnings = 0;
  
      if (targetNumber === 0 && container.classList.contains('placed-green')) {
        winnings = amount * 14;
        won = true;
      } else if (targetNumber !== 0 &&targetNumber % 2 === 0 && container.classList.contains('placed-black')) {
        winnings = amount * 2;
        won = true;
      } else if (targetNumber !== 0 &&targetNumber % 2 === 1 && container.classList.contains('placed-red')) {
        winnings = amount * 2;
        won = true;
      }
  
      if (won) {
        userTotalWinAmount += winnings - userTotalBetAmount;
        playWinSound();
        try {
          const response = await updateBalance(winnings);
          if (response.ok) {
            user.balance = Number((user.balance + winnings).toFixed(2));
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('balanceUpdate'));
          }
        } catch (error) {
          console.error('Error updating balance for winner:', error);
        }
      }
      await updateBetStats(won);
      if (betterName === user.username) {
        await addRecentBet(
          'Roulette',
          userTotalBetAmount,
          won ? winnings : -userTotalBetAmount,
          won
        );
      }
    }
  
    const netLoss = Math.max(userTotalBetAmount - userTotalWinAmount, 0);
  
    // Update total winnings and losses in database
    try {
      await updateWinnings(userTotalWinAmount, netLoss);
    } catch (error) {
      console.error('Error updating winnings:', error);
    }
  };

  ///////////////////////////////
  //         COUNTDOWN         //
  ///////////////////////////////

  useEffect(() => {
    const countdownText = document.querySelector('.countdown-text');
    const countdownBar = document.querySelector('.countdown-bar');

    if (!countdownText || !countdownBar) return;

    if (gameState.spinning) {
      countdownText.textContent = 'Rolling...';
    } else {
      countdownText.textContent = `Rolling in ${gameState.countdown}...`;
      
      // Reset the bar when countdown starts
      if (gameState.countdown === 10) {
        countdownBar.style.transition = 'none';
        countdownBar.style.width = '100%';
        // Force reflow
        void countdownBar.offsetHeight;
      }
      
      // Smooth transition for the countdown
      countdownBar.style.transition = 'width 1s linear';
      // Calculate width percentage based on remaining time
      const widthPercentage = ((gameState.countdown - 1) / 9) * 100;
      countdownBar.style.width = `${widthPercentage}%`;
    }
  }, [gameState.countdown, gameState.spinning]);

  ///////////////////////////////
  //         BETS              //
  ///////////////////////////////

  async function handleBet(amount, color) {
    if (!localStorage.getItem('token')) {
      alert('Please login to place a bet');
      return;
    }

    if (gameState.spinning) {
      alert('Please wait for the current spin to complete');
      return;
    }

    setIsBetProcessing(true);
    
    const betButton = document.querySelector(`.bet-${color}`);
    if (betButton.dataset.betting === 'true') {
      return;
    }
    betButton.dataset.betting = 'true';
    
    const user = JSON.parse(localStorage.getItem('user'));
    const bettersName = user.username;
    const wagerInput = document.querySelector('.wager-input input');
    const wagerAmount = Number(Number(wagerInput.value).toFixed(2)) || 0;
    
    if (wagerAmount <= 0) {
      betButton.dataset.betting = 'false';
      alert('Please enter a valid bet amount');
      return;
    }

    if (wagerAmount > user.balance) {
      betButton.dataset.betting = 'false';
      alert('You do not have enough balance to place this bet');
      return;
    }

    //Update Local Frontend
    const totalPlaced = document.querySelector(`.total-placed-${color} span`);
    totalPlaced.textContent = Number(totalPlaced.textContent) + wagerAmount;

    try {
      // Update balance in database
      await updateBalance(-wagerAmount);
      
      // Update local balance
      const updatedBalance = Number((user.balance - wagerAmount).toFixed(2));
      user.balance = updatedBalance;
      localStorage.setItem('user', JSON.stringify(user));
      
      // Emit bet via socket
      socket.emit('place_bet', {
        color,
        amount: wagerAmount,
        username: bettersName
      });

      window.dispatchEvent(new Event('balanceUpdate'));
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      betButton.dataset.betting = 'false';
      setIsBetProcessing(false);
    }
  }

  useEffect(() => {
    window.isBetProcessing = isBetProcessing;
    return () => {
      window.isBetProcessing = false;
    };
  }, [isBetProcessing]);

  useEffect(() => {
    const handleRouletteState = (event) => {
      const state = event.detail;
      setGameState(state);
      setIsLoading(false);
  
      if (state.currentSpin?.inProgress) {
        const elapsedTime = Date.now() - state.currentSpin.startTime;
        if (elapsedTime < state.currentSpin.duration) {
          const remainingTime = state.currentSpin.duration - elapsedTime;
          
          const timeoutId = setTimeout(() => {
            const container = numbersContainerRef.current;
            if (container) {
              container.style.transition = "none";
              container.style.transform = "translateX(0px)";
            }
          }, remainingTime);
  
          return () => clearTimeout(timeoutId);
        }
      }
    };
  
    const handleNewBet = (event) => {
      setGameState(prev => ({
        ...prev,
        currentBets: event.detail
      }));
    };
  
    const handleRollResult = (event) => {
      const { number, previousRolls } = event.detail;
      spinToNumber(number);
      setGameState(prev => ({
        ...prev,
        previousRolls
      }));
    };
  
    window.addEventListener('rouletteState', handleRouletteState);
    window.addEventListener('newBet', handleNewBet);
    window.addEventListener('rollResult', handleRollResult);
  
    return () => {
      window.removeEventListener('rouletteState', handleRouletteState);
      window.removeEventListener('newBet', handleNewBet);
      window.removeEventListener('rollResult', handleRollResult);
    };
  }, []);

  useEffect(() => {
    socket.on('bet_update', (data) => {
      const { color, bets, totalAmount, totalBetters } = data;
      
      // Update total betters count
      const totalBettersElement = document.querySelector(`.total-betters-${color} span`);
      if (totalBettersElement) {
        totalBettersElement.textContent = totalBetters;
      }

      // Update total amount
      const totalAmountElement = document.querySelector(`.total-amount-${color} span`);
      if (totalAmountElement) {
        totalAmountElement.textContent = totalAmount.toFixed(2);
      }

      // Clear existing bets for this color
      const container = document.querySelector(`.placed-${color}`);
      if (container) {
        container.innerHTML = '';
      }

      // Add all bets in sorted order
      Object.entries(bets).forEach(([username, amount]) => {
        const betElement = document.createElement('div');
        betElement.className = 'bet-entry';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = `placed-${color}-name`;
        nameSpan.textContent = username;
        
        const amountSpan = document.createElement('span');
        amountSpan.className = `placed-${color}-amount`;
        amountSpan.textContent = parseFloat(amount).toFixed(2);
        
        betElement.appendChild(nameSpan);
        betElement.appendChild(amountSpan);
        container.appendChild(betElement);
      });
    });

    return () => {
      socket.off('bet_update');
    };
  }, []);

  useEffect(() => {
    setHideFooter(isLoading);
  }, [isLoading, setHideFooter]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="roulette-page">
      <Chat />
      <div className="roulette-container">
        <div className="countdown-container">
          <div className="countdown-text">{gameState.countdown}</div>
          <div className="countdown-bar"></div>
        </div>
        <div className="roll-list">
          <h2>Previous rolls:</h2>
          <div className="roll-item">
            {gameState.previousRolls.slice(-10).map((roll, index) => {
              const color = roll === 0 ? "green" : roll % 2 === 0 ? "black" : "red";
              return (
                <span 
                  key={`${roll}-${gameState.previousRolls.length}-${index}`} 
                  className={`${color} ${index === 0 ? 'new-roll' : ''}`}
                >
                  {roll}
                </span>
              );
            })}
          </div>
        </div>
        <div className="roulette-wrapper">
          <div className="center-marker"></div>
            <div className="roulette-wheel" ref={numbersContainerRef}>
              {numbers.map((num, index) => (
                <div
                  key={index}
                  className={`number ${num.color}`}
                >
                {num.value}
              </div>
            ))}
        </div>
        </div>
        <div className="wager">
          <h2>Wager:</h2>
          <div className="wager-input roulette-wager-input">
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
        <div className="bets-container">
          <div className="bet-input">
            <button className="bet-red" onClick={() => handleBet(0, "red")}>Odd, Win 2x</button>
            <button className="bet-black" onClick={() => handleBet(0, "black")}>Even, Win 2x</button>
            <button className="bet-green" onClick={() => handleBet(0, "green")}>0, Win 14x</button>
          </div>
          <div className="total-placed">
            <div className="total-placed-red">
              <FontAwesomeIcon icon={faMoneyBill1Wave} size="2xl" style={{color: "#e23636",}} /><span> 0</span>
            </div>
            <div className="total-placed-black">
              <FontAwesomeIcon icon={faMoneyBill1Wave} size="2xl" style={{color: "#8e8f8f",}} /><span> 0</span>
            </div>
            <div className="total-placed-green">
              <FontAwesomeIcon icon={faMoneyBill1Wave} size="2xl" style={{color: "#059669",}} /><span> 0</span>
            </div>
          </div>
          <div className="total-betters">
            <div className="total-betters-red">
              <div className="betters-info">
                <FontAwesomeIcon icon={faUser} />
                <span>0</span>
              </div>
              <div className="total-amount total-amount-red">
                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                <span>0</span>
              </div>
            </div>
            <div className="total-betters-black">
              <div className="betters-info">
                <FontAwesomeIcon icon={faUser} />
                <span>0</span>
              </div>
              <div className="total-amount total-amount-black">
                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                <span>0</span>
              </div>
            </div>
            <div className="total-betters-green">
              <div className="betters-info">
                <FontAwesomeIcon icon={faUser} />
                <span>0</span>
              </div>
              <div className="total-amount total-amount-green">
                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                <span>0</span>
              </div>
            </div>
          </div>
          <div className="placed-container">
            <div className="placed-red">
              <span className="placed-red-name"></span>
              <span className="placed-red-amount"></span>
            </div>
            <div className="placed-black">
              <span className="placed-black-name"></span>
              <span className="placed-black-amount"></span>
            </div>
            <div className="placed-green">
              <span className="placed-green-name"></span>
              <span className="placed-green-amount"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;