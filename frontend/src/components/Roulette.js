import React, { useRef, useState, useEffect } from "react";
import "./Roulette.css";

function Roulette () {
  const [chosenNumber, setChosenNumber] = useState(null);
  const numbersContainerRef = useRef();
  const [spinning, setSpinning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [betHistory, setBetHistory] = useState([]);

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
    const dramaticMultiplier = [2, 2.2, 2.5][
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
      container.style.transition = "none";
      container.style.transform = "translateX(0px)";
      setSpinning(false);
      setCountdown(10);
      setBetHistory(prevHistory => {
        const newHistory = [...prevHistory, targetNumber];
        return newHistory.slice(-10);
      });
    }, 13000);

  };

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

  function handleBet (number, color) {
    if (!localStorage.getItem('token')) {
      alert('Please login to place a bet');
      return;
    }
    const bettersName = document.querySelector('.user-info').textContent.split(':')[1].trim();
    const wagerInput = document.querySelector('.wager-input input');
    const betAmount = parseInt(wagerInput.value) || 0;
    
    if (betAmount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    const currentBetElement = document.querySelector(`.placed-${color} span`);
    const currentBetText = currentBetElement.textContent;
    let currentAmount = 0;

    if (currentBetText.includes('$')) {
      currentAmount = parseInt(currentBetText.split('$')[1]) || 0;
    }

    const totalBet = currentAmount + betAmount;

    currentBetElement.textContent = `${bettersName}: $${totalBet}`;
  };

  function handleClearBet() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = '';
  }

  function handlePlusOne() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1;
    }
  }

  function handlePlusTen() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 10;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 10;
    }
  }

  function handlePlusOneHundred() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 100;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 100;
    }
  }

  function handlePlusOneThousand() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1000;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1000;
    }
  }

  function handleHalf() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) / 2;
  }
  
  function handleDouble() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) * 2;
  }

  function handleMax() {
    const wagerInput = document.querySelector('.wager-input input');
    const userBalance = JSON.parse(localStorage.getItem('user')).balance;
    if(userBalance.toString().includes('.00')) {
      wagerInput.value = parseInt(userBalance);
    } else {
      wagerInput.value = userBalance;
    }
  }

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
              <span>Betters Name: $</span>
            </div>
          </button>
          <button className="bet-black" onClick={() => handleBet(0, "black")}>Black
            <div className="placed-black">
              <span>Betters Name: $</span>
            </div>
          </button>
          <button className="bet-green" onClick={() => handleBet(0, "green")}>Green
            <div className="placed-green">
              <span>Betters Name: $</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
