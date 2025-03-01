import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const logo = require('../images/CasinoLogo.png');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', formData);

      if (!data) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      handleErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorMessage = (err) => {
    if (err.response.status === 401) {
      setError('Username or password is incorrect');
    } else if (err.response.status === 400) {
      setError('Server error');
    } else {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      {error && <div className="error-message">{error}</div>}
      <div className="logo login-logo">
        <img src={logo} alt="Casino Logo" />
      </div>
      <div className="auth-container">
        <h3>Authentication</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Your username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Your password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <div className="auth-spinner"></div>
            ) : (
              'SIGN IN'
            )}
          </button>
          <div className="account-creation">
            <p>Don't have an account yet?</p>
            <button className="account-creation-button" onClick={() => navigate("/signup")} disabled={isLoading}>
              {isLoading ? (
                <div className="auth-spinner"></div>
              ) : (
                'SIGN UP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
