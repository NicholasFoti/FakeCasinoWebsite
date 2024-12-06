import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faCoins, faHouse, faDice, faDiamond, faClover } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const prevBalanceRef = useRef();
  const balanceRef = useRef();
  const logo = require('../images/CasinoLogo.png');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      prevBalanceRef.current = parsedUser.balance;
    }

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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
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
      </div>
      <div className="logged-in-info">
        {user ? (
          <>
            <div className="user-info-container">
              <span className="user-info">Logged in as: {user.username}</span>
              <span className="user-balance" ref={balanceRef}>
              <FontAwesomeIcon icon={faCoins} size="xl" style={{color: "#FFD43B",}} /> {Number(user.balance).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              </span>
            </div>
            <button onClick={() => navigate('/profile')} className="auth-button profile-button">Profile</button>
            <button onClick={handleLogout} className="auth-button logout-button">Logout</button>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button login-button">Login</Link>
            <Link to="/signup" className="auth-button sign-up-button">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;