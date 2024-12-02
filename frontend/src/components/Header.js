import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const prevBalanceRef = useRef();
  const balanceRef = useRef();

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
        <h1>Fake Casino</h1>
      </div>
      <div className="header-buttons">
        <Link className="home-button" to="/">Home</Link>
        <Link className="home-button" to="/roulette">Roulette</Link>
        <Link className="home-button" to="/blackjack">Blackjack</Link>
        <Link className="home-button" to="/slots">Slots</Link>
      </div>
      <div className="logged-in-info">
        {user ? (
          <>
            <div className="user-info-container">
              <span className="user-info">Logged in as: {user.username}</span>
              <span className="user-balance" ref={balanceRef}>
                Balance: ${Number(user.balance).toFixed(2)}
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