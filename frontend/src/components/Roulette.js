import React, { useRef, useState, useEffect } from "react";
import "./Roulette.css";

function Roulette () {
  const [chosenNumber, setChosenNumber] = useState(null);
  const numbersContainerRef = useRef();
  const [spinning, setSpinning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [betHistory, setBetHistory] = useState([]);
  const balanceRef = useRef();

  const baseNumbers = Array.from({ length: 37 }, (_, i) => ({
    value: i,
    color: i === 0 ? "green" : i % 2 === 0 ? "black" : "red",
  }));

  const numbers = [
    ...baseNumbers.slice(-5),
    ...Array(5).fill(null).flatMap(() => baseNumbers),
    ...baseNumbers.slice(0, 5),
  ];

  function spinToNumber (targetNumber) {
    const container = numbersContainerRef.current;
    const dramaticMultiplier = [2, 2.2, 2.3][
      Math.floor(Math.random() * 3)
    ];

    const targetIndex = numbers.findIndex((num) => num.value === targetNumber);

    if (targetIndex === -1) return;

    const numberWidth = 80;
    const containerWidth = container.parentElement.offsetWidth;
    const totalNumbers = baseNumbers.length;

    const spins = 3;

    const targetOffset =
      spins * totalNumbers * numberWidth +
      targetIndex * numberWidth -
      containerWidth / 2 +
      numberWidth * dramaticMultiplier;

    container.style.transition = "transform 10s ease-in-out";
    container.style.transform = `translateX(-${targetOffset}px)`;

    setSpinning(true);

    setTimeout(() => {
      handleWinnings(targetNumber);
    }, 10000);

    setTimeout(() => {
      container.style.transition = "none";
      container.style.transform = "translateX(0px)";
      setSpinning(false);
      setCountdown(10);
      setBetHistory(prevHistory => {
        const newHistory = [...prevHistory, targetNumber];
        return newHistory.slice(-10);
      });
      const allBetElements = document.querySelectorAll('.placed-red, .placed-black, .placed-green');
      allBetElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('winning-bet', 'losing-bet');
      });
    }, 13000);

  };

  async function handleWinnings(targetNumber) {
    const allBetElements = document.querySelectorAll('.placed-red span, .placed-black span, .placed-green span');
    
    for (const element of allBetElements) {
      if (!element.textContent) continue;
      
      const [username, betAmount] = element.textContent.split('$');
      const betterName = username.replace(':', '').trim();
      const amount = parseFloat(betAmount);
      
      if (!betterName || !amount) continue;

      let winnings = 0;
      let won = false;

      if (targetNumber === 0) {
        if (element.closest('.placed-green')) {
          winnings = amount * 14;
          won = true;
        }
      } else if (targetNumber % 2 === 0) {
        if (element.closest('.placed-black')) {
          winnings = amount * 2;
          won = true;
        }
      } else {
        if (element.closest('.placed-red')) {
          winnings = amount * 2;
          won = true;
        }
      }

      if (won) {
        try {
          const response = await updateBalance(winnings);
          if (response.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user.username === betterName) {
              user.balance = Number((user.balance + winnings).toFixed(2));
              localStorage.setItem('user', JSON.stringify(user));
              window.dispatchEvent(new Event('balanceUpdate'));
            }
          }
        } catch (error) {
          console.error('Error updating balance for winner:', error);
        }
      }
    }

    if (targetNumber === 0) {
      document.querySelectorAll('.placed-red, .placed-black').forEach(el => el.classList.add('losing-bet'));
      document.querySelectorAll('.placed-green').forEach(el => el.classList.add('winning-bet'));
    } else if (targetNumber % 2 === 0) {
      document.querySelectorAll('.placed-green, .placed-red').forEach(el => el.classList.add('losing-bet'));
      document.querySelectorAll('.placed-black').forEach(el => el.classList.add('winning-bet'));
    } else {
      document.querySelectorAll('.placed-green, .placed-black').forEach(el => el.classList.add('losing-bet'));
      document.querySelectorAll('.placed-red').forEach(el => el.classList.add('winning-bet'));
    }
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!spinning) {
      const randomNumber = Math.floor(Math.random() * 37);
      setChosenNumber(randomNumber);
      spinToNumber(randomNumber);
    }
  }, [countdown, spinning]);

  async function updateBalance(amount) {
    const numericAmount = Number(Number(amount).toFixed(2));
    
    const response = await fetch('http://localhost:3001/api/game/update-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: JSON.parse(localStorage.getItem('user')).id,
        amount: numericAmount
      })
    });
    return response;
  };

  async function handleBet(number, color) {
    if (!localStorage.getItem('token')) {
      alert('Please login to place a bet');
      return;
    }

    if (spinning) {
      alert('Please wait for the current spin to complete');
      return;
    }
    
    const betButton = document.querySelector(`.bet-${color}`);
    if (betButton.dataset.betting === 'true') {
      return;
    }
    betButton.dataset.betting = 'true';
    
    const user = JSON.parse(localStorage.getItem('user'));
    const bettersName = user.username;
    const wagerInput = document.querySelector('.wager-input input');
    const betAmount = Number(Number(wagerInput.value).toFixed(2)) || 0;
    
    if (betAmount <= 0) {
      betButton.dataset.betting = 'false';
      alert('Please enter a valid bet amount');
      return;
    }

    const userBalance = Number(user.balance);
    if (betAmount > userBalance) {
      betButton.dataset.betting = 'false';
      alert('You do not have enough balance to place this bet');
      return;
    }

    let currentBetElement = document.querySelector(`.placed-${color} span`);
    
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

    try {
        const updateBalanceResponse = await updateBalance(-betAmount);
        
        if (updateBalanceResponse.ok) {
            let currentAmount = 0;
            if (currentBetElement.textContent && currentBetElement.textContent.includes('$')) {
                currentAmount = Number(Number(currentBetElement.textContent.split('$')[1]).toFixed(2)) || 0;
            }

            const totalBet = Number((currentAmount + betAmount).toFixed(2));
            currentBetElement.textContent = `${bettersName}: $${totalBet.toFixed(2)}`;
            
            user.balance = Number((user.balance - betAmount).toFixed(2));
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('balanceUpdate'));
        } else {
            const errorData = await updateBalanceResponse.json();
            alert(errorData.message || 'Failed to update balance');
        }
    } catch (error) {
        console.error('Error placing bet:', error);
        alert('Failed to place bet. Please try again.');
    } finally {
        betButton.dataset.betting = 'false';
    }
  };

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

  return (
    <div className="roulette-container">
      <div className="roll-list">
        <h2>Previous rolls:</h2>
        <div className="roll-item">
          {betHistory.slice(-10).map((roll, index) => {
            const color = roll === 0 ? "green" : roll % 2 === 0 ? "black" : "red";
            return (
              <span key={index} className={color}>
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
      <div className="result-display">
        <div className="current-number">
          Current Number:{" "}
          <span>
            {chosenNumber !== null ? chosenNumber : "No spin yet"}
          </span>
        </div>
        <div className="countdown">
          {spinning ? "Spinning..." : `Next spin in: ${countdown}s`}
        </div>
      </div>
      <div className="bets-container">
        <h2>Place your bets</h2>
        <div className="bet-input">
          <button className="bet-red" onClick={() => handleBet(0, "red")}>Red
            <div className="placed-red">
              <span></span>
            </div>
          </button>
          <button className="bet-black" onClick={() => handleBet(0, "black")}>Black
            <div className="placed-black">
              <span></span>
            </div>
          </button>
          <button className="bet-green" onClick={() => handleBet(0, "green")}>Green
            <div className="placed-green">
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
