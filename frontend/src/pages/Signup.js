import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function Signup () {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const logo = require('../images/CasinoLogo.png');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Password's do not match");
      return;
    }
    setIsLoading(true);

    try {
      const { data } = await api.post('/api/auth/signup', formData);

      if (!data) {
        throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {error && <div className="error-message">{error}</div>}
      <div className="logo signup-logo">
        <img src={logo} alt="Casino Logo" />
      </div>
      <div className="auth-container">
        <h3>Account Creation</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <div className="auth-spinner"></div>
            ) : (
              'SIGN UP'
            )}
          </button>
          <div className="account-creation">
            <p>Already have an account?</p>
            <button className="account-creation-button" onClick={() => navigate("/login")} disabled={isLoading}>
              {isLoading ? (
                <div className="auth-spinner"></div>
              ) : (
                'SIGN IN'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 