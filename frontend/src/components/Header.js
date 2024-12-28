import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faCoins, faHouse, faDice, faDiamond, faClover, faTrophy, faCircle, faThumbsUp, faExplosion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [totalBets, setTotalBets] = useState(0);
  const navigate = useNavigate();
  const prevBalanceRef = useRef();
  const balanceRef = useRef();
  const logo = require('../images/CasinoLogo.png');
  const chip = require('../images/chip.png');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      prevBalanceRef.current = parsedUser.balance;
    }

    const fetchTotalBets = async () => {
      try {
        const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/total-bets' : 'http://localhost:3001/api/game/total-bets';

        const response = await fetch(apiUrl);
        const data = await response.json();
        setTotalBets(data.totalBets || 0);
      } catch (error) {
        console.error('Error fetching total bets:', error);
      }
    };

    fetchTotalBets();

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
            
      if (updatedUser) {
        const parsedUser = JSON.parse(updatedUser);
        
        if (prevBalanceRef.current !== undefined) {
          const balanceElement = balanceRef.current;
          if (balanceElement) {
            if (parsedUser.balance > prevBalanceRef.current) {
              balanceElement.classList.remove('balance-flash-red', 'balance-flash-green');
              void balanceElement.offsetWidth;
              balanceElement.classList.add('balance-flash-green');
            } else if (parsedUser.balance < prevBalanceRef.current) {
              balanceElement.classList.remove('balance-flash-red', 'balance-flash-green');
              void balanceElement.offsetWidth;
              balanceElement.classList.add('balance-flash-red');
            }
          }
        }
        
        setUser(parsedUser);
        prevBalanceRef.current = parsedUser.balance;
      }
    };

    window.addEventListener('balanceUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('balanceUpdate', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cached_recent_bets');
    localStorage.removeItem('recent_bets_timestamp');
    window.dispatchEvent(new Event('logout'));
    navigate('/login');
  };

  return (
    <header className="casino-header">
      <div className="header-content">
        <Link to="/" className="header-logo"><img src={logo} alt="Fake Casino" /></Link>
      </div>
      <div className="header-buttons">
        <Link className="home-button header-button" to="/"><FontAwesomeIcon className="header-icon" icon={faHouse} />Home</Link>
        <Link className="roulette-button header-button" to="/roulette"><FontAwesomeIcon className="header-icon" icon={faDice} />Roulette</Link>
        <Link className="blackjack-button header-button" to="/blackjack"><FontAwesomeIcon className="header-icon" icon={faDiamond} />Blackjack</Link>
        <Link className="slots-button header-button" to="/slots"><FontAwesomeIcon className="header-icon" icon={faClover} />Slots</Link>
        <Link className="plinko-button header-button" to="/plinko"><FontAwesomeIcon className="header-icon" icon={faCircle} />Plinko</Link>
        <Link className="heads-or-tails-button header-button" to="/coinflip"><FontAwesomeIcon className="header-icon" icon={faThumbsUp} />Heads or Tails</Link>
        <Link className="crash-button header-button" to="/crash"><FontAwesomeIcon className="header-icon" icon={faExplosion} />Crash</Link>
        <Link className="leaderboard-button header-button" to="/leaderboard"><FontAwesomeIcon className="header-icon" icon={faTrophy} />Leaderboard</Link>
      </div>
      <div className="total-bets-placed">
        <img src={chip} />
        <span className="total-bets-placed-span">{totalBets.toLocaleString()}</span>
        <p>Total Bets</p>
      </div>
      <div className="logged-in-info">
        {user ? (
          <>
            <div className="user-info-container">
              <span className="user-balance" ref={balanceRef}>
              <FontAwesomeIcon icon={faCoins} size="xl" style={{color: "#FFD43B",}} /> {Number(user.balance).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              </span>
            </div>
            <div className="auth-buttons">
              <Link to="/profile" className="auth-button profile-button">Profile</Link>
              <Link to="/" onClick={handleLogout} className="auth-button logout-button">Logout</Link>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button login-button">Log In</Link>
            <Link to="/signup" className="auth-button sign-up-button">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;