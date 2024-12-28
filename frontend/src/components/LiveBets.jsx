import React, { useEffect, useState } from "react";
import './LiveBets.css';

const LiveBets = ({ bets }) => {
  const [maxVisible, setMaxVisible] = useState(11);

  // Update maxVisible based on screen size
  const updateMaxVisible = () => {
    const width = window.innerWidth;
    if (width > 1920) {
      setMaxVisible(13 + Math.floor((width - 1920) / 100));
    } else {
      setMaxVisible(11);
    }
  };

  // Monitor screen resizing
  useEffect(() => {
    updateMaxVisible();
    window.addEventListener("resize", updateMaxVisible);

    return () => {
      window.removeEventListener("resize", updateMaxVisible);
    };
  }, []);

  return (
    <div className="live-bets-card">
        <div className="live-bets-header">
        <span className="live-bet-indicator"></span>
        <h3>Live Bets</h3>
        </div>
        <div className="live-bets">
        <div className="live-bets-info">
            <span>User</span>
            <span>Bet</span>
            <span>Profit</span>
        </div>
        <div className="live-bets-reel">
          {bets.slice(-maxVisible).map((bet, index) => (
            <div key={index} className={`live-bet-item ${bet.profit >= 0 ? 'positive' : ''}`}>
              <span>{bet.user}</span>
              <span>{bet.amount}</span>
              <span>{bet.profit < 0 ? '↓' : '↑'} {Math.abs(bet.profit)}</span>
            </div>
          ))}
        </div>
    </div>
    </div>
  );
};

export default LiveBets;