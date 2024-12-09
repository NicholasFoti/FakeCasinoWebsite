import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1Wave, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import winSound from '../sounds/money.mp3';
import spinSound from '../sounds/spinWheel.mp3';
import Chat from '../components/Chat';

import "./Roulette.css";

function Roulette () {
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
  const [currentSpinAudio, setCurrentSpinAudio] = useState(null);
  const [isBetProcessing, setIsBetProcessing] = useState(false);

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
    const dramaticMultiplier = [2.12, 2.2][Math.floor(Math.random() * 2)];

    if (window.innerWidth >= 1900) {
      return (
        spins * totalNumbers * numberWidth +
        targetIndex * numberWidth +
        (containerWidth / 2) - (numberWidth / 2) +
        (numberWidth * 2) * dramaticMultiplier
      );
    } else if (window.innerWidth >= 1600) {
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
      
      container.style.transition = `transform ${10000 - elapsedTime}ms cubic-bezier(0.4, 0.0, 0.15, 0.985)`;
      container.style.transform = `translateX(-${targetOffset}px)`;
    } else {
      container.style.transition = "transform 10s cubic-bezier(0.4, 0.0, 0.15, 0.985)";
      container.style.transform = `translateX(-${targetOffset}px)`;
      if (!isMuted) {
        playSpinSound();
      }
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
      const allBetElements = document.querySelectorAll('.placed-red-name, .placed-black-name, .placed-green-name, .placed-red-amount, .placed-black-amount, .placed-green-amount');
      allBetElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('winning-bet', 'losing-bet');
      });

      const totalPlaced = document.querySelectorAll('.total-placed-red span, .total-placed-black span, .total-placed-green span');
      totalPlaced.forEach(element => {
        element.textContent = 0;
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
    if (isMuted) return;
    
    if (currentWinAudio) {
      currentWinAudio.pause();
      currentWinAudio.currentTime = 0;
    }
    
    const audio = new Audio(winSound);
    audio.play().catch(error => console.error('Error playing win sound:', error));
    setCurrentWinAudio(audio);
  }

  function playSpinSound() {
    if (isMuted) return;
    
    if (currentSpinAudio) {
      currentSpinAudio.pause();
      currentSpinAudio.currentTime = 0;
    }
    
    const audio = new Audio(spinSound);
    audio.volume = 0.2;
    audio.play().catch(error => console.error('Error playing spin sound:', error));
    setCurrentSpinAudio(audio);
  }

  function toggleMute() {
    setIsMuted(prev => !prev);
    
    if (currentWinAudio) {
      currentWinAudio.pause();
      currentWinAudio.currentTime = 0;
      setCurrentWinAudio(null);
    }
    
    if (currentSpinAudio) {
      currentSpinAudio.pause();
      currentSpinAudio.currentTime = 0;
      setCurrentSpinAudio(null);
    }
  }

  ///////////////////////////////
  //         WINNINGS          //
  ///////////////////////////////

  async function handleWinnings(targetNumber) {
    const allBetElements = document.querySelectorAll('.placed-red, .placed-black, .placed-green');
    
    //Return if user is not logged in.
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    for (const container of allBetElements) {
      const nameElement = container.querySelector('[class*="-name"]');
      const amountElement = container.querySelector('[class*="-amount"]');
      
      const betterName = nameElement?.textContent?.trim();
      const amount = parseFloat(amountElement?.textContent);
      
      // Only check for wins if this is the current user's bet and there's an amount
      if (betterName === user.username && amount > 0) {
        let isWinningBet = false;
        
        if (targetNumber === 0 && container.classList.contains('placed-green')) {
          isWinningBet = true;
        } else if (targetNumber % 2 === 0 && container.classList.contains('placed-black')) {
          isWinningBet = true;
        } else if (targetNumber % 2 === 1 && container.classList.contains('placed-red')) {
          isWinningBet = true;
        }

        if (isWinningBet) {
          playWinSound();
          break;
        }
      }
    }

    const totalBetAmount = Array.from(document.querySelectorAll('.total-amount'))
    .reduce((sum, element) => sum + parseFloat(element.textContent), 0);

    const totalBetAmountWon = Array.from(document.querySelectorAll('.total-amount'))
      .filter(element => {
        if (targetNumber === 0) {
          return element.classList.contains('total-amount-green');
        } else if (targetNumber % 2 === 0) {
          return element.classList.contains('total-amount-black');
        } else {
          return element.classList.contains('total-amount-red');
        }
      })
      .reduce((sum, element) => {
        const amount = parseFloat(element.textContent);
        if (targetNumber === 0) {
          console.log('its zero');
          return sum + (amount * 14 - amount);
        } else {
          return sum + amount;
        }
      }, 0);

    const netLoss = Math.max(totalBetAmount - totalBetAmountWon, 0);
    console.log(netLoss);
    console.log(totalBetAmountWon);

    for (const container of allBetElements) {
      const nameElement = container.querySelector('[class*="-name"]');
      const amountElement = container.querySelector('[class*="-amount"]');
      
      if (!nameElement.textContent || !amountElement.textContent) continue;
      
      const betterName = nameElement.textContent.trim();
      const amount = parseFloat(amountElement.textContent);
      
      if (!betterName || !amount) continue;

      let winnings = 0;
      let won = false;

      if (targetNumber === 0) {
        if (container.classList.contains('placed-green')) {
          winnings = amount * 14;
          won = true;
        }
      } else if (targetNumber % 2 === 0) {
        if (container.classList.contains('placed-black')) {
          winnings = amount * 2;
          won = true;
        }
      } else {
        if (container.classList.contains('placed-red')) {
          winnings = amount * 2;
          won = true;
        }
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (user.username === betterName) {
        await updateBetStats(won);
        
        if (won) {
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
      }
    }

    //Update total_winnings and total_losses in database
    try{
      await updateWinnings(totalBetAmountWon, netLoss);
    } catch (error) {
      console.error('Error updating winnings:', error);
    }
  }

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

    const userBalance = Number(user.balance);
    if (wagerAmount > userBalance) {
      betButton.dataset.betting = 'false';
      alert('You do not have enough balance to place this bet');
      return;
    }

    let currentBetElement = document.querySelector(`.placed-${color} span`);
    let currentBetNameElement = document.querySelector(`.placed-${color} span.placed-${color}-name`);
    let currentBetAmountElement = document.querySelector(`.placed-${color} span.placed-${color}-amount`);

    if (!currentBetElement) {
        const container = document.querySelector(`.placed-${color}`);
        if (!container) {
            betButton.dataset.betting = 'false';
            console.error(`Could not find container for color ${color}`);
            return;
        }
        currentBetElement = document.createElement('span');
        container.appendChild(currentBetElement);
    }

    // Update frontend immediately
    let currentAmount = 0;
    if (currentBetAmountElement) {
      currentAmount = Number(Number(currentBetAmountElement.textContent).toFixed(2)) || 0;
    }

    const totalBet = Number((currentAmount + wagerAmount).toFixed(2));
  
    currentBetNameElement.textContent = bettersName;
    currentBetAmountElement.textContent = `${totalBet.toFixed(2)}`;

    const currentTotalBetElement = document.querySelector(`.total-placed-${color} span`);
    currentTotalBetElement.textContent = `${totalBet.toFixed(2)}`;

    const currentTotalBettersElement = document.querySelector(`.total-betters-${color} span`);
    setGameState(prev => ({
      ...prev,
      currentBets: {
        ...prev.currentBets,
        [color]: {
          ...prev.currentBets[color],
          [bettersName]: wagerAmount
        }
      }
    }));

    const totalAmountElement = document.querySelector(`.total-amount-${color} span`);
    if (totalAmountElement) {
      totalAmountElement.textContent = ` ${totalBet}`;
    }
    const updatedBalance = Number((user.balance - wagerAmount).toFixed(2));
    user.balance = updatedBalance;
    localStorage.setItem('user', JSON.stringify(user));

    setTimeout(() => {
      window.dispatchEvent(new Event('balanceUpdate'));
    }, 0);

    //Update balance (after frontend)
    try {
        await updateBalance(-wagerAmount);
    } catch (error) {
        console.error('Error placing bet:', error);
        alert('Failed to place bet. Please try again.');
    } finally {
        betButton.dataset.betting = 'false';
        setIsBetProcessing(false);
    }
  };

  useEffect(() => {
    window.isBetProcessing = isBetProcessing;
    return () => {
      window.isBetProcessing = false;
    };
  }, [isBetProcessing]);

  //////////////////////////////
  //      API CALLS          //
  //////////////////////////////

  // Update balance in database
  async function updateBalance(amount) {
    const numericAmount = Number(Number(amount).toFixed(2));
    
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-balance' : 'http://localhost:3001/api/game/update-balance';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: JSON.parse(localStorage.getItem('user')).id,
        amount: numericAmount,
      })
    });
    return response;
  };

  // Update bet stats in database
  async function updateBetStats(won) {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-bet-stats' : 'http://localhost:3001/api/game/update-bet-stats';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                userId: JSON.parse(localStorage.getItem('user')).id,
                won: won
            })
        });
        
        if (response.ok) {
            const userData = await response.json();
            const user = JSON.parse(localStorage.getItem('user'));
            user.bets_won = userData.stats.bets_won;
            user.bets_lost = userData.stats.bets_lost;
            localStorage.setItem('user', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Error updating bet stats:', error);
    }
  };

  // Update winnings in database
  async function updateWinnings(winAmount, lossAmount) {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-winnings' : 'http://localhost:3001/api/game/update-winnings';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('user')).id, winAmount, lossAmount })
    });
    return response;
  }

  //////////////////////////////
  //   WAGER BUTTON HELPERS   //
  //////////////////////////////

  function handleClearBet() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = '';
  };

  function handlePlusOne() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1;
    }
  };

  function handlePlusTen() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 10;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 10;
    }
  };

  function handlePlusOneHundred() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 100;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 100;
    }
  };

  function handlePlusOneThousand() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1000;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1000;
    }
  };

  function handleHalf() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) / 2;
  };
  
  function handleDouble() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) * 2;
  };

  function handleMax() {
    const wagerInput = document.querySelector('.wager-input input');
    const userBalance = JSON.parse(localStorage.getItem('user')).balance;
    if(userBalance.toString().includes('.00')) {
      wagerInput.value = parseInt(userBalance);
    } else {
      wagerInput.value = userBalance;
    }
  };

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
        <button id="muteButton" className="mute-button" onClick={toggleMute}>Mute</button>
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
          <div className="wager-input">
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