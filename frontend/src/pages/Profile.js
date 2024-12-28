import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [recentBets, setRecentBets] = useState(() => {
    const cached = localStorage.getItem('cached_recent_bets');
    return cached ? JSON.parse(cached) : [];
  });

  const formattedDate = new Date(user.date_created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchRecentUserBets = async () => {
      try {
        const lastFetch = localStorage.getItem('recent_bets_timestamp');
        const now = Date.now();

        if (!lastFetch || (now - parseInt(lastFetch)) > 60000) {
            const token = localStorage.getItem('token');

            const apiUrl = process.env.NODE_ENV === 'production' 
            ? 'https://fakecasinowebsite.onrender.com/api/game/recent-user-bets'
            : 'http://localhost:3001/api/game/recent-user-bets';
  
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (response.ok) {
            const data = await response.json();
            setRecentBets(data);
            localStorage.setItem('cached_recent_bets', JSON.stringify(data));
            localStorage.setItem('recent_bets_timestamp', now.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching recent bets:', error);
      }
    };

    fetchRecentUserBets();

    const interval = setInterval(fetchRecentUserBets, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('cached_recent_bets', JSON.stringify(recentBets));
  }, [recentBets]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('cached_recent_bets');
      localStorage.removeItem('recent_bets_timestamp');
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  return (
    <div className="profile-page">
        <div className="profile-container">
            <div className="profile-header">
                <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username || 'User'}`}
                alt="Profile" 
                className="profile-avatar"
                />
                <div className="profile-info">
                <h1 className="profile-username">{user.username}</h1>
                <div className="profile-stats">
                    <div className="stat-item">
                    <div className="stat-value">${Number(user.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</div>
                    <div className="stat-label">Balance</div>
                    </div>
                    <div className="stat-item">
                    <div className="stat-value">{user.bets_won + user.bets_lost > 0 
                        ? ((user.bets_won / (user.bets_won + user.bets_lost)) * 100).toFixed(1) 
                        : '0'}%</div>
                    <div className="stat-label">Win Rate</div>
                    </div>
                    <div className="stat-item">
                    <div className="stat-value">{user.bets_won + user.bets_lost}</div>
                    <div className="stat-label">Total Bets</div>
                    </div>
                </div>
                </div>
            </div>

            <div className="profile-sections">
                <div className="profile-section">
                <h2 className="section-title">Recent Bets</h2>
                <div className="bet-history">
                    {recentBets.map((bet, index) => (
                        <div className="bet-item" key={index}>
                            <span className="bet-game">{bet.game_type}</span>
                            <span className="bet-amount">${bet.bet_amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</span>
                            <span className={`bet-profit ${bet.bet_profit < 0 ? 'loss' : 'won'}`}>{bet.bet_profit < 0 ? '↓' : '↑'}{Math.abs(bet.bet_profit).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</span>
                        </div>
                    ))}
                </div>
                </div>

                <div className="profile-section">
                <h2 className="section-title">Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-box">
                    <div className="stat-label">Total Wins</div>
                    <div className="stat-value">{user.bets_won || 0}</div>
                    </div>
                    <div className="stat-box">
                    <div className="stat-label">Total Losses</div>
                    <div className="stat-value">{user.bets_lost || 0}</div>
                    </div>
                    <div className="stat-box">
                    <div className="stat-label">Member Since</div>
                    <div className="stat-value">{formattedDate}</div>
                    </div>
                    <div className="stat-box">
                    <div className="stat-label">Total Profit/Loss</div>
                    <div className="stat-value">${(user.total_winnings - user.total_losses || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</div>
                    </div>
                </div>
                </div>
            </div>

            <div className="profile-actions">
                <button className="profile-page-button logout-button" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                }}>Logout</button>
            </div>
        </div>
    </div>
  );
}

export default Profile; 
