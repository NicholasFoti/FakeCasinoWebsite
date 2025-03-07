import React, { useState, useEffect, useRef } from 'react';
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
import './Slots.css';

const Slots = () => {
  // Slot machine symbols
  const symbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "💎", "7️⃣", "🎰"];
  const reelLength = 3;
  
  // State variables
  const [reels, setReels] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [isBetProcessing, setIsBetProcessing] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [spinningReels, setSpinningReels] = useState([]);
  const [leverPulled, setLeverPulled] = useState(false);
  
  // Refs for tracking final symbols and animation
  const finalSymbolsRef = useRef([]);
  const spinTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const masterVolumeRef = useRef(null);

  // Initialize the reels once on component mount
  useEffect(() => {
    // Initialize reels with random symbols
    const initialReels = [[], [], []];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < reelLength; j++) {
        initialReels[i].push(getRandomSymbol());
      }
    }
    setReels(initialReels);
    
    // Initialize audio context
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterVolumeRef.current = audioContextRef.current.createGain();
      masterVolumeRef.current.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
      masterVolumeRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error("Web Audio API is not supported in this browser", error);
    }
    
    // Cleanup function
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
      }
    };
  }, []);

  // Get a random symbol
  const getRandomSymbol = () => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  // Handle bet input change
  const handleBetChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setBetAmount(value === '' ? 0 : parseFloat(value));
    }
  };

  // Custom wager button handlers that update the state
  const customHandleClearBet = () => {
    handleClearBet();
    setBetAmount(0);
  };

  const customHandlePlusOne = () => {
    handlePlusOne();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandlePlusTen = () => {
    handlePlusTen();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandlePlusOneHundred = () => {
    handlePlusOneHundred();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandlePlusOneThousand = () => {
    handlePlusOneThousand();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandleHalf = () => {
    handleHalf();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandleDouble = () => {
    handleDouble();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  const customHandleMax = () => {
    handleMax();
    const input = document.querySelector('.wager-input input');
    setBetAmount(parseFloat(input.value));
  };

  // Generate final symbols for all reels
  const generateFinalSymbols = () => {
    const finalSymbols = [];
    for (let i = 0; i < 3; i++) {
      finalSymbols.push([]);
      for (let j = 0; j < reelLength; j++) {
        finalSymbols[i].push(getRandomSymbol());
      }
    }
    console.log("Middle row (winning line) will be:", [finalSymbols[0][1], finalSymbols[1][1], finalSymbols[2][1]]);
    return finalSymbols;
  };

  // Start spinning the reels
  const startSpin = async () => {
    if (spinning || isBetProcessing || betAmount <= 0) return;
    
    // Pull the lever animation
    setLeverPulled(true);
    
    // Play lever pull sound
    playLeverSound();
    
    // Add shake effect to slot machine
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.classList.add('shake');
    
    // Remove shake class after animation completes
    setTimeout(() => {
      slotMachine.classList.remove('shake');
    }, 300);
    
    // Return the lever to original position after animation
    setTimeout(() => {
      setLeverPulled(false);
    }, 800);
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to play');
      return;
    }
    
    if (user.balance < betAmount) {
      alert('Insufficient balance');
      return;
    }
    
    setIsBetProcessing(true);
    window.isBetProcessing = true;
    
    try {
      // Update balance in database
      await updateBalance(-betAmount);
      
      // Update user balance in local storage
      user.balance -= betAmount;
      localStorage.setItem('user', JSON.stringify(user));
      
      // Trigger balance update event
      window.dispatchEvent(new Event('balanceUpdate'));
      
      // Generate final symbols for all reels
      finalSymbolsRef.current = generateFinalSymbols();
      
      // Start spinning animation
      setSpinning(true);
      setGameResult(null);
      setWinAmount(0);
      
      // Start spinning reels with delay
      const newSpinningReels = [];
      setSpinningReels(newSpinningReels);
      
      setTimeout(() => {
        newSpinningReels.push(0);
        setSpinningReels([...newSpinningReels]);
        playNote(160);
        
        setTimeout(() => {
          newSpinningReels.push(1);
          setSpinningReels([...newSpinningReels]);
          playNote(180);
          
          setTimeout(() => {
            newSpinningReels.push(2);
            setSpinningReels([...newSpinningReels]);
            playNote(200);
            
            // Spin for a random duration between 2-3 seconds
            const spinDuration = 2000 + Math.random() * 1000;
            spinReels(spinDuration, newSpinningReels);
          }, 100);
        }, 100);
      }, 100);
    } catch (error) {
      console.error('Error processing bet:', error);
      setIsBetProcessing(false);
      window.isBetProcessing = false;
    }
  };

  // Spin the reels for a duration
  const spinReels = (duration, spinningReelsList) => {
    const spinInterval = 100; // Update every 100ms
    const iterations = Math.floor(duration / spinInterval);
    let count = 0;
    
    // Clear any existing timer
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
    }
    
    // Start new timer for spinning animation
    spinTimerRef.current = setInterval(() => {
      // Update reels with new random symbols during spinning
      setReels(prevReels => {
        const newReels = [...prevReels];
        spinningReelsList.forEach(reelIndex => {
          // Shift symbols up and add a new one at the bottom
          newReels[reelIndex] = [...newReels[reelIndex].slice(1), getRandomSymbol()];
        });
        return newReels;
      });
      
      count++;
      
      // Stop spinning after iterations
      if (count >= iterations) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
        stopSpinning(spinningReelsList);
      }
    }, spinInterval);
  };

  // Stop spinning and determine results
  const stopSpinning = (spinningReelsList) => {
    // Stop reels one by one with delay
    const stopReelWithDelay = (index) => {
      if (index >= spinningReelsList.length) {
        // All reels stopped, verify the final display matches our predetermined symbols
        // Extract the middle row from each column (reel)
        const currentMiddleRow = [
          reels[0] && reels[0][1] ? reels[0][1] : null,
          reels[1] && reels[1][1] ? reels[1][1] : null,
          reels[2] && reels[2][1] ? reels[2][1] : null
        ];
        
        const expectedMiddleRow = [
          finalSymbolsRef.current[0][1],
          finalSymbolsRef.current[1][1],
          finalSymbolsRef.current[2][1]
        ];
        
        // If there's a mismatch, force the correct display
        if (JSON.stringify(currentMiddleRow) !== JSON.stringify(expectedMiddleRow) || 
            currentMiddleRow.includes(null)) {
          setReels([...finalSymbolsRef.current]);
          // Give a small delay to ensure the UI updates before checking wins
          setTimeout(() => checkWins(), 50);
        } else {
          checkWins();
        }
        return;
      }
      
      const reelIndex = spinningReelsList[index];
      playNote(300 - index * 30, 0.1);
      
      // Set the final symbols for this reel
      setReels(prevReels => {
        const newReels = [...prevReels];
        // Make sure we have a valid array to modify
        if (!newReels[reelIndex] || !Array.isArray(newReels[reelIndex])) {
          newReels[reelIndex] = [];
        }
        newReels[reelIndex] = [...finalSymbolsRef.current[reelIndex]];
        return newReels;
      });
      
      // Remove the reel from spinning list
      setSpinningReels(prev => prev.filter(r => r !== reelIndex));
      
      // Continue with next reel after delay
      setTimeout(() => stopReelWithDelay(index + 1), 300);
    };
    
    // Start stopping reels
    stopReelWithDelay(0);
  };

  // Check for winning combinations
  const checkWins = async () => {
    // Get middle row symbols (the visible row) from our pre-generated final symbols
    const visibleSymbols = [
      finalSymbolsRef.current[0][1], 
      finalSymbolsRef.current[1][1], 
      finalSymbolsRef.current[2][1]
    ];
    
    // Count occurrences of each symbol
    const symbolCounts = {};
    visibleSymbols.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    let win = false;
    let multiplier = 0;
    let winningSymbol = null;
    
    // Check for three of a kind (highest priority)
    for (const symbol in symbolCounts) {
      if (symbolCounts[symbol] === 3) {
        win = true;
        winningSymbol = symbol;
        // Multiplier based on symbol value (higher index = higher value)
        multiplier = (symbols.indexOf(symbol) + 1) * 5;
        break;
      }
    }
    
    // If no three of a kind, check for two of a kind
    if (!win) {
      for (const symbol in symbolCounts) {
        if (symbolCounts[symbol] === 2) {
          win = true;
          winningSymbol = symbol;
          // Multiplier based on symbol value
          multiplier = (symbols.indexOf(symbol) + 1) * 1.5;
          break;
        }
      }
    }
    
    // Calculate win amount
    const calculatedWinAmount = win ? betAmount * multiplier : 0;
    setWinAmount(calculatedWinAmount);
    
    // Set game result
    if (win) {
      setGameResult({
        type: 'win',
        message: `You won ${calculatedWinAmount.toFixed(2)} coins with ${symbolCounts[winningSymbol]} ${winningSymbol}!`,
        winningSymbol
      });
      
      // Play win sound
      playWinChime(Math.min(20, Math.floor(multiplier)));
      
      // Update balance and stats
      try {
        await updateBalance(calculatedWinAmount);
        await updateWinnings(calculatedWinAmount, 0);
        await updateBetStats(true);
        await addRecentBet('Slots', betAmount, calculatedWinAmount, true);
        
        // Update user balance in local storage
        const user = JSON.parse(localStorage.getItem('user'));
        user.balance = parseFloat(user.balance) + parseFloat(calculatedWinAmount);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Trigger balance update event
        window.dispatchEvent(new Event('balanceUpdate'));
      } catch (error) {
        console.error('Error updating win:', error);
      }
    } else {
      setGameResult({
        type: 'lose',
        message: 'Better luck next time!'
      });
      
      // Update stats for loss
      try {
        await updateWinnings(0, betAmount);
        await updateBetStats(false);
        await addRecentBet('Slots', betAmount, -betAmount, false);
      } catch (error) {
        console.error('Error updating loss:', error);
      }
    }
    
    // Reset state
    setSpinning(false);
    setIsBetProcessing(false);
    window.isBetProcessing = false;
  };

  // Play a note with Web Audio API
  const playNote = (freq = 1000, dur = 0.1, type = 'square') => {
    if (!audioContextRef.current) return Promise.resolve();
    
    return new Promise(resolve => {
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      oscillator.connect(masterVolumeRef.current);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + dur);
      oscillator.onended = resolve;
    });
  };

  // Play win chime sequence
  const playWinChime = (amount) => {
    if (!audioContextRef.current) return;
    
    const clampedAmount = amount > 20 ? 20 : amount;
    playNote(400 + 100 * (20 - clampedAmount), 0.05, 'sine');
    
    if (--amount > 0) {
      setTimeout(() => {
        playWinChime(amount);
      }, 70);
    }
  };

  // Play lever pull sound
  const playLeverSound = () => {
    if (!audioContextRef.current) return;
    
    try {
      // Create oscillator for mechanical click sound
      const clickOsc = audioContextRef.current.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
      
      // Create gain node for volume envelope
      const clickGain = audioContextRef.current.createGain();
      clickGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      clickGain.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
      clickGain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.15);
      
      // Connect nodes
      clickOsc.connect(clickGain);
      clickGain.connect(masterVolumeRef.current);
      
      // Start and stop
      clickOsc.start(audioContextRef.current.currentTime);
      clickOsc.stop(audioContextRef.current.currentTime + 0.15);
      
      // Create spring sound
      setTimeout(() => {
        const springOsc = audioContextRef.current.createOscillator();
        springOsc.type = 'sine';
        springOsc.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
        springOsc.frequency.exponentialRampToValueAtTime(50, audioContextRef.current.currentTime + 0.5);
        
        const springGain = audioContextRef.current.createGain();
        springGain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
        springGain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
        
        springOsc.connect(springGain);
        springGain.connect(masterVolumeRef.current);
        
        springOsc.start(audioContextRef.current.currentTime);
        springOsc.stop(audioContextRef.current.currentTime + 0.5);
      }, 100);
      
    } catch (error) {
      console.error("Error playing lever sound:", error);
    }
  };

  // Handle lever pull
  const handleLeverPull = () => {
    if (!spinning && !isBetProcessing && betAmount > 0) {
      startSpin();
    }
  };

  // Check if a symbol is part of a winning combination
  const checkWinningSymbol = (reelIndex, symbolIndex) => {
    if (!gameResult || gameResult.type !== 'win' || symbolIndex !== 1) {
      return false;
    }
    
    // Get the middle row symbols (winning line)
    const middleRowSymbols = finalSymbolsRef.current.map(reel => reel[1]);
    
    // Check for three of a kind
    const firstSymbol = middleRowSymbols[0];
    const threeOfAKind = middleRowSymbols.every(symbol => symbol === firstSymbol);
    
    // Check for two of a kind (first two, last two, or first and last)
    const firstTwoMatch = middleRowSymbols[0] === middleRowSymbols[1];
    const lastTwoMatch = middleRowSymbols[1] === middleRowSymbols[2];
    const firstLastMatch = middleRowSymbols[0] === middleRowSymbols[2];
    
    // Determine if this specific symbol is part of a winning combination
    if (threeOfAKind) {
      return true;
    } else if (firstTwoMatch && (reelIndex === 0 || reelIndex === 1)) {
      return true;
    } else if (lastTwoMatch && (reelIndex === 1 || reelIndex === 2)) {
      return true;
    } else if (firstLastMatch && (reelIndex === 0 || reelIndex === 2)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="slots-page">
      <div className="slots-main-card">
        <div className="game-area">
        {gameResult && (
              <div className={`result-message ${gameResult.type}`}>
                {gameResult.message}
              </div>
            )}
          <div className="slot-machine">
            {/* Decorative lights */}
            <div className="slot-machine-lights">
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
              <div className="light"></div>
            </div>
            
            {/* Top display */}
            <div className="slot-machine-top"></div>
            
            <div className="reels-container">
              {reels.map((reel, reelIndex) => (
                <div 
                  key={reelIndex} 
                  className={`reel-container ${spinningReels.includes(reelIndex) ? 'spinning' : ''}`}
                >
                  {reel.map((symbol, symbolIndex) => (
                    <div 
                      key={symbolIndex} 
                      className={`reel-item ${symbolIndex === 1 ? 'center' : ''} ${
                        !spinning && 
                        symbolIndex === 1 && 
                        gameResult && 
                        gameResult.type === 'win' && 
                        checkWinningSymbol(reelIndex, symbolIndex) ? 'winning' : ''
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Bottom panel */}
            <div className="slot-machine-bottom"></div>
            
            {/* Slot Machine Lever */}
            <div 
              className={`slot-lever ${leverPulled ? 'pulled' : ''} ${!leverPulled && spinning ? 'return' : ''}`}
              onClick={handleLeverPull}
              style={{ pointerEvents: spinning || isBetProcessing || betAmount <= 0 ? 'none' : 'auto' }}
            >
              <div className="lever-base"></div>
              <div className="lever-stick-container">
                <div className="lever-stick"></div>
                <div className="lever-handle"></div>
              </div>
            </div>
          </div>
          
          <div className="controls">
            <div className="wager">
              <h2>Wager:</h2>
              <div className="wager-input wager-input">
                <input 
                  type="number" 
                  placeholder="Enter your wager" 
                  onChange={handleBetChange} 
                  value={betAmount || ''}
                />
                <button className="wager-button clear" onClick={customHandleClearBet}>Clear</button>
                <button className="wager-button +1" onClick={customHandlePlusOne}>+1</button>
                <button className="wager-button +10" onClick={customHandlePlusTen}>+10</button>
                <button className="wager-button +100" onClick={customHandlePlusOneHundred}>+100</button>
                <button className="wager-button +1000" onClick={customHandlePlusOneThousand}>+1000</button>
                <button className="wager-button 1/2" oClick={customHandleHalf}>1/2</button>
                <button className="wager-button 2x" onlick={customHandleDouble}>2x</button>
                <button className="wager-button max" oClick={customHandleMax}>Max</button>
              </div>
            </div>
          </div>
          
          <div className="prize-table">
            <div className="prize-section">
              <h3>Payouts</h3>
              <div className="prizes">
                {symbols.map((symbol, index) => (
                  <div key={index} className="prize-item">
                    <div className="prize-symbols">
                      {symbol}{symbol}{symbol}
                    </div>
                    <div className="prize-value">
                      {((index + 1) * 5)}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="prize-section">
              <h3>Two of a Kind</h3>
              <div className="prizes">
                {symbols.map((symbol, index) => (
                  <div key={index} className="prize-item">
                    <div className="prize-symbols">
                      {symbol}{symbol}❓
                    </div>
                    <div className="prize-value">
                      {((index + 1) * 1.5)}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Chat />
    </div>
  );
};

export default Slots; 