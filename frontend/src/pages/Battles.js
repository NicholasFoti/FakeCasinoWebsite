import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import cases from '../data/cases';
import { updateBalance, updateWinnings, updateBetStats, addRecentBet } from "../utils/winnings";
import Chat from '../components/Chat';
import './Battles.css';

function Battles() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [numberOfCases, setNumberOfCases] = useState(3);
  const [playerItems, setPlayerItems] = useState([]);
  const [opponentItems, setOpponentItems] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [isBetProcessing, setIsBetProcessing] = useState(false);

  const startBattle = async () => {
    if (!selectedCase) {
      alert('Please select a case');
      return;
    }

    const totalCost = cases[selectedCase].price * numberOfCases;
    const user = JSON.parse(localStorage.getItem('user'));

    if (totalCost > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setIsBetProcessing(true);
    try {
      await updateBalance(-totalCost);
      
      // Update local balance
      user.balance = Number((user.balance - totalCost).toFixed(2));
      localStorage.setItem('user', JSON.stringify(user));
      
      // Start the battle animation
      setIsSpinning(true);
      simulateBattle();
      
    } catch (error) {
      console.error('Error starting battle:', error);
      alert('Failed to start battle');
    } finally {
      setIsBetProcessing(false);
    }
  };

  const simulateBattle = () => {
    const playerResults = [];
    const opponentResults = [];
    const selectedCaseData = cases[selectedCase];

    // Simulate opening cases
    for (let i = 0; i < numberOfCases; i++) {
      playerResults.push(openCase(selectedCaseData));
      opponentResults.push(openCase(selectedCaseData));
    }

    // Animate results
    animateResults(playerResults, opponentResults);
  };

  const openCase = (caseData) => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const item of caseData.items) {
      cumulative += item.chance;
      if (random <= cumulative) {
        return { ...item };
      }
    }
    
    return { ...caseData.items[0] };
  };

  const animateResults = (playerResults, opponentResults) => {
    if (!playerResults?.length || !opponentResults?.length) {
      console.error('Invalid results:', { playerResults, opponentResults });
      setIsSpinning(false);
      return;
    }

    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < numberOfCases) {
        const playerItem = playerResults[currentIndex];
        const opponentItem = opponentResults[currentIndex];
        
        if (playerItem?.name && playerItem?.value && playerItem?.color) {
          setPlayerItems(prev => [...prev, playerItem]);
        }
        if (opponentItem?.name && opponentItem?.value && opponentItem?.color) {
          setOpponentItems(prev => [...prev, opponentItem]);
        }
        
        currentIndex++;
      } else {
        clearInterval(interval);
        handleBattleEnd(playerResults, opponentResults);
      }
    }, 1000);
  };

  const handleBattleEnd = async (playerResults, opponentResults) => {
    if (!playerResults?.length || !opponentResults?.length) {
      console.error('Invalid results in handleBattleEnd');
      setIsSpinning(false);
      return;
    }

    const playerTotal = playerResults.reduce((sum, item) => sum + (Number(item?.value) || 0), 0);
    const opponentTotal = opponentResults.reduce((sum, item) => sum + (Number(item?.value) || 0), 0);
    
    const won = playerTotal > opponentTotal;
    const totalCost = Number(cases[selectedCase].price) * numberOfCases;
    const profit = won ? playerTotal - totalCost : -totalCost;

    setBattleResult({ won, playerTotal, opponentTotal, profit });
    setIsSpinning(false);

    if (won) {
      await updateBalance(playerTotal);
      const user = JSON.parse(localStorage.getItem('user'));
      const newBalance = Number(user.balance) + Number(playerTotal);
      user.balance = newBalance.toFixed(2);
      localStorage.setItem('user', JSON.stringify(user));
    }

    await Promise.all([
      updateBetStats(won),
      updateWinnings(won ? playerTotal : 0, totalCost),
      addRecentBet('Battles', totalCost, profit, won)
    ]);

    window.dispatchEvent(new Event('balanceUpdate'));
  };

  useEffect(() => {
    return () => {
      setPlayerItems([]);
      setOpponentItems([]);
      setBattleResult(null);
      setIsSpinning(false);
      setIsBetProcessing(false);
    };
  }, []);

  return (
    <div className="battles-page">
      <Chat />
      <div className="battles-container">
        <h2>Case Battles</h2>
        
        <div className="case-selection">
          {Object.entries(cases).map(([id, caseData]) => (
            <div 
              key={id}
              className={`case-option ${selectedCase === id ? 'selected' : ''}`}
              onClick={() => setSelectedCase(id)}
            >
              <h3>{caseData.name}</h3>
              <p>${caseData.price}</p>
            </div>
          ))}
        </div>

        <div className="cases-amount">
          <button onClick={() => setNumberOfCases(Math.max(1, numberOfCases - 1))}>-</button>
          <span>{numberOfCases} Cases</span>
          <button onClick={() => setNumberOfCases(Math.min(10, numberOfCases + 1))}>+</button>
        </div>

        <button 
          className="start-battle" 
          onClick={startBattle}
          disabled={isSpinning || isBetProcessing}
        >
          Start Battle (${selectedCase ? cases[selectedCase].price * numberOfCases : 0})
        </button>

        <div className="battle-area">
          <div className="player-side">
            <h3>Your Items</h3>
            <div className="items-container">
              {playerItems.map((item, index) => (
                <div 
                  key={index} 
                  className="item" 
                  style={{ borderColor: item.color }}
                >
                  <p>{item.name}</p>
                  <span>${item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="opponent-side">
            <h3>Opponent's Items</h3>
            <div className="items-container">
              {opponentItems.map((item, index) => (
                <div 
                  key={index} 
                  className="item" 
                  style={{ borderColor: item.color }}
                >
                  <p>{item.name}</p>
                  <span>${item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {battleResult && (
          <div className={`battle-result ${battleResult.won ? 'won' : 'lost'}`}>
            <h3>{battleResult.won ? 'You Won!' : 'You Lost!'}</h3>
            <p>Your Total: ${battleResult.playerTotal}</p>
            <p>Opponent Total: ${battleResult.opponentTotal}</p>
            <p>Profit: ${battleResult.profit}</p>
            <button onClick={() => {
              setBattleResult(null);
              setPlayerItems([]);
              setOpponentItems([]);
            }}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Battles; 