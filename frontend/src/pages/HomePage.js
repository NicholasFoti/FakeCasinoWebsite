import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="main-card">
      <h2>Welcome to Fake Casino</h2>
      <p>Experience the thrill of real casino games without the risk!</p>
      <div className="main-card-buttons">
        <Link to="/games" className="main-card-button">Browse Games</Link>
      </div>
    </div>
  );
};

export default HomePage; 