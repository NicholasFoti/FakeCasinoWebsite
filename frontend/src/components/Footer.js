import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="casino-footer">
      <p>Made by <a target="_blank" rel="noopener noreferrer" href="https://github.com/NicholasFoti">Nicholas Foti</a><FontAwesomeIcon className="casino-footer-icon" icon={faSackDollar} /></p>
    </footer>
  );
};

export default Footer; 