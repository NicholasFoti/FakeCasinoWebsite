import React, { useState, useEffect } from 'react';
import multiavatar from '@multiavatar/multiavatar';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [recentBets, setRecentBets] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_id || '');


  const formattedDate = new Date(user.date_created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateAvatarOptions = () => {
    const options = [];
    const seeds = Array.from({ length: 24 }, () => Math.random().toString(36).substring(7));
    seeds.forEach(seed => {
      options.push(multiavatar(seed));
    });
    return options;
  };

  const handleProfilePictureChange = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = async (avatarSvg) => {
    try{
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://fakecasinowebsite.onrender.com/api/user/update-avatar'
        : 'http://localhost:3001/api/user/update-avatar';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          avatarId: avatarSvg
        })
      });

      if (response.ok) {
        const updatedUser = { ...user, avatar_id: avatarSvg };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  useEffect(() => {
    const fetchRecentUserBets = async () => {
      try {
        const lastFetch = localStorage.getItem('recent_bets_timestamp');
        const now = Date.now();
        
        // Use cached data if it's less than 1 minute old
        if (lastFetch && (now - parseInt(lastFetch)) <= 60000) {
          const cached = localStorage.getItem('cached_recent_bets');
          if (cached) {
            const parsedBets = JSON.parse(cached);
            setRecentBets(parsedBets);
            return parsedBets;
          }
        }

        // Fetch new data if cache is old or missing
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? 'https://fakecasinowebsite.onrender.com/api/user/recent-user-bets'
          : 'http://localhost:3001/api/user/recent-user-bets';

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent bets');
        }
        
        const data = await response.json();
        
        // Ensure data is an array and cache it
        const betsArray = Array.isArray(data) ? data : [];
        localStorage.setItem('cached_recent_bets', JSON.stringify(betsArray));
        localStorage.setItem('recent_bets_timestamp', now.toString());
        
        setRecentBets(betsArray);
        return betsArray;
      } catch (error) {
        console.error('Error fetching recent bets:', error);
        return [];
      }
    };

    // Initial fetch
    fetchRecentUserBets().then(setRecentBets);

    // Set up polling interval
    const interval = setInterval(() => {
      fetchRecentUserBets().then(setRecentBets);
    }, 60000);

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
                <div className="profile-picture-container">
                  <div className="profile-avatar" 
                    dangerouslySetInnerHTML={{ 
                      __html: user.avatar_id || multiavatar(user.username) 
                    }} 
                  />
                  <button className="profile-picture-edit-button" onClick={handleProfilePictureChange}>
                    Change Avatar
                  </button>

                  {showAvatarModal && (
                    <div className="avatar-modal">
                      <div className="avatar-modal-content">
                        <h3>Select an Avatar</h3>
                        <div className="avatar-grid">
                          {generateAvatarOptions().map((avatarSvg, index) => (
                            <div 
                              key={index}
                              className={`avatar-option ${selectedAvatar === avatarSvg ? 'selected' : ''}`}
                              onClick={() => handleAvatarSelect(avatarSvg)}
                              dangerouslySetInnerHTML={{ __html: avatarSvg }}
                            />
                          ))}
                        </div>
                        <button onClick={() => setShowAvatarModal(false)}>Close</button>
                      </div>
                    </div>
                  )}
                </div>
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
