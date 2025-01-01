import React, { useEffect, useState } from "react";
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
          {Array.isArray(bets) && bets
            .slice(0, maxVisible)
            .map((bet, index) => (
              <div key={index} className={`live-bet-item ${bet.bet_profit > 0 ? 'positive' : ''}`}>
                <span>{bet.username}</span>
                <span><FontAwesomeIcon icon={faCoins} className="live-bet-coin" size="l" />{bet.bet_amount}</span>
                <span>{bet.bet_profit < 0 ? '↓' : bet.bet_profit > 0 ? '↑' : '-'} {Math.abs(bet.bet_profit)}</span>
              </div>
            ))}
        </div>
    </div>
    </div>
  );
};

export default LiveBets;