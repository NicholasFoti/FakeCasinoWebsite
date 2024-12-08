import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [winningsLeaders, setWinningsLeaders] = useState([]);
  const [winsLeaders, setWinsLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchWinningsLeaderboard = async () => {
      try {
        const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/leaderboard' : 'http://localhost:3001/api/game/leaderboard';
        const response = await fetch(apiUrl);
        const data = await response.json();
        setWinningsLeaders(data.leaders || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWinsLeaderboard = async () => {
      try {
        const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/leaderboard/wins' : 'http://localhost:3001/api/game/leaderboard/wins';
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        setWinsLeaders(data.leaders || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinningsLeaderboard();
    fetchWinsLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard total-winnings">
        <h2>Total Winnings</h2>
        <h3>Top 10 Players</h3>
        {loading ? (
          <div className="spinner"></div>
        ) : (
        <ul>
        {winningsLeaders.map((leader, index) => (
          <li key={index}>
            <span className="leaderboard-position">{index + 1}.</span> {leader.username}: ${leader.total_winnings - leader.total_losses}
          </li>
            ))}
          </ul>
        )}
      </div>
      <div className="leaderboard top-players">
        <h2>Total Wins</h2>
        <h3>Top 10 Players</h3>
        {loading ? (
          <div className="spinner"></div>
        ) : (
        <ul>
        {winsLeaders.map((leader, index) => (
          <li key={index}>
            <span className="leaderboard-position">{index + 1}.</span> {leader.username}: {leader.bets_won}
          </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 