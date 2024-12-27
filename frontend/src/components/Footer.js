import React from 'react';
import { Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import { faLink} from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  const logo = require('../images/CasinoLogo.png');

  return (
    <footer className="casino-footer">
      <div className="top-footer">
        <div className="logo footer-logo">
        <Link to="/" className="footer-logo"><img src={logo} alt="Fake Casino" /></Link>
        </div>
        <div className="social-links">
          <div className="github">
          <a href="https://github.com/NicholasFoti" target="_blank"><FontAwesomeIcon icon={faGithub} size="2xl" style={{color: "#070e1c",}} /></a>
          </div>
          <div className="portfolio">
          <a href = "https://nfotiportfolio.netlify.app" target="_blank"><FontAwesomeIcon icon={faLink} size="2xl" style={{color: "#070e1c",}} /></a>
          </div>
          <div className="linkedin">
          <a href="https://www.linkedin.com/in/nicholasfoti1008/" target="_blank"><FontAwesomeIcon icon={faLinkedin} size="2xl" style={{color: "#070e1c",}} /></a>
          </div>
        </div>
      </div>
      <div className="bottom-footer">
        <p>All Rights Reserved &copy;. Nicholas Foti</p>
      </div>
    </footer>
  );
};

export default Footer; 