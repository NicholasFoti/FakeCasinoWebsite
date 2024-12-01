import React, { useRef, useState, useEffect } from "react";
import "./Roulette.css";

const Roulette = () => {
  const [chosenNumber, setChosenNumber] = useState(null);
  const numbersContainerRef = useRef();
  const [spinning, setSpinning] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const baseNumbers = Array.from({ length: 37 }, (_, i) => ({
    value: i,
    color: i === 0 ? "green" : i % 2 === 0 ? "black" : "red",
  }));

  const numbers = [
    ...baseNumbers.slice(-5),
    ...Array(5).fill(null).flatMap(() => baseNumbers),
    ...baseNumbers.slice(0, 5),
  ];

  const spinToNumber = (targetNumber) => {
    const container = numbersContainerRef.current;
    const dramaticMultiplier = [2, 2.2, 2.5, 2.55][
      Math.floor(Math.random() * 4)
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

  return (
    <div className="roulette-container">
      <div className="roulette-wrapper">
        <div className="center-marker"></div>
        <div className="roulette-wheel" ref={numbersContainerRef}>
          {numbers.map((num, index) => (
            <div
              key={index}
              className={`number ${num.color} ${
                chosenNumber === num.value ? "selected" : ""
              }`}
            >
              {num.value}
            </div>
          ))}
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
          <div className="bet-red">Red
          <div className="placed-red">
              <span>0</span>
            </div>
          </div>
          <div className="bet-black">Black
          <div className="placed-black">
              <span>0</span>
            </div>
          </div>
          <div className="bet-green">Green
          <div className="placed-green">
            <span>0</span>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Roulette;
