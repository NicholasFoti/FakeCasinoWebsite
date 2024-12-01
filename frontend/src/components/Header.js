import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="casino-header">
      <h1>Welcome to the Fake Casino!</h1>
      <p>Enjoy your stay with our exciting games and fake currency!</p>
      <button className="home-button" onClick={() => navigate('/')}>Home</button>
      <div className="logged-in-info">
        {user ? (
          <>
          <div className="user-info-container">
          <span className="user-info">Logged in as: {user.username}</span>
          <span className="user-balance">Balance: ${user.balance}</span>
          </div>
            <button onClick={() => navigate('/profile')} className="auth-button profile-button">Profile</button>
            <button onClick={handleLogout} className="auth-button logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-button">Login</Link>
            <Link to="/signup" className="auth-button">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 