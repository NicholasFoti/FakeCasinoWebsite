import React, { useEffect, useState } from 'react';
import DOTS from 'vanta/dist/vanta.dots.min';
import { socket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight} from '@fortawesome/free-solid-svg-icons';
import LiveBets from '../components/LiveBets';
import './HomePage.css';

const HomePage = () => {
  const [websocketConnections, setWebsocketConnections] = useState(0);
  const navigate = useNavigate();
  const [vantaEffect, setVantaEffect] = useState(null);

  const bets = [
    { user: "User1", amount: 100, profit: 20 },
    { user: "User2", amount: 200, profit: -50 },
    { user: "User3", amount: 150, profit: 30 },
    { user: "User4", amount: 150, profit: 30 },
    { user: "User5", amount: 150, profit: 30 },
    { user: "User6", amount: 150, profit: -30 },
    { user: "User7", amount: 150, profit: -30 },
    { user: "User8", amount: 150, profit: 30 },
    { user: "User9", amount: 150, profit: 30 },
    { user: "User10", amount: 150, profit: -30 },
    { user: "User11", amount: 150, profit: -30 },
    { user: "User12", amount: 150, profit: -30 },
    { user: "User13", amount: 150, profit: -30 },
    { user: "User14", amount: 150, profit: -30 },
    { user: "User15", amount: 150, profit: -30 },
    { user: "User16", amount: 150, profit: -30 },
    { user: "User17", amount: 150, profit: -30 },
    { user: "User18", amount: 150, profit: -30 },
  ];

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        DOTS({
          el: "#welcome-card",
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 100.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x1a98cd,
          color2: 0xd2c2c2,
          backgroundColor: 0x13171e,
          size: 10,
          spacing: 100.00,
          showLines: false
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await fetch(
          process.env.NODE_ENV === 'production'
            ? 'https://fakecasinowebsite.onrender.com/api/online-connections'
            : 'http://localhost:3001/api/online-connections'
        );
        if (response.ok) {
          const data = await response.json();
          setWebsocketConnections(data.connections);
        } else {
          console.error('Failed to fetch initial connections:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching initial connections:', error);
      }
    };
  
    fetchInitialCount();
  
    // Listen for WebSocket updates
    const handleUpdateConnections = (count) => {
      setWebsocketConnections(count);
    };
  
    socket.on('updateConnections', handleUpdateConnections);
  
    // Cleanup the WebSocket listener on unmount
    return () => {
      socket.off('updateConnections', handleUpdateConnections);
    };
  }, []);

  return (
    <div className="main-card">
      <div className="main-section">
        <div className="intro-cards">
          <div className="welcome-card" id="welcome-card">
              <div className="welcome-card-text">
                <h2>Welcome to the<br></br> Fake Casino</h2>
                <p>Feed your gambling addiction without re-mortgaging your house!</p>
              </div>
              <div className="casino-stats">
                <h3>Casino Stats</h3>
                <p>Players Online: <span>{websocketConnections}</span></p>
                <p>Total Bets Today: <span>$10,541</span></p>
              </div>
          </div>
          <div className="divider-bar">
            <svg height="800px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.006 512.006" xmlSpace="preserve">
              <circle style={{ fill: '#C7EAFB' }} cx="176.096" cy="176.096" r="143.946" />
              <path style={{ fill: '#ABE1FA' }} d="M265.086,63.122c48.822,62.744,37.538,153.183-25.207,202.004 c-51.988,40.457-124.809,40.457-176.798,0c48.822,62.744,139.26,74.028,202.004,25.207s74.028-139.26,25.207-202.004 C282.96,78.908,274.499,70.447,265.086,63.122z" />
              <path style={{ fill: '#FFFFFF' }} d="M64.122,184.117c-4.414,0-7.997-3.583-7.997-7.997c0-66.247,53.708-119.955,119.955-119.955 c4.414,0,7.997,3.583,7.997,7.997s-3.583,7.997-7.997,7.997c-57.418,0-103.961,46.543-103.961,103.961 C72.119,180.534,68.536,184.117,64.122,184.117z" />
              <path style={{ fill: 'lightblue' }} d="M507.156,441.38c6.414,6.43,6.414,16.842,0,23.271l-42.544,42.544c-6.43,6.414-16.842,6.414-23.271,0 L324.824,390.679c-6.414-6.43-6.414-16.842,0-23.271l42.544-42.544c6.43-6.414,16.842-6.414,23.271,0L507.156,441.38z" />
              <path style={{ fill: '#35495C' }} d="M357.372,334.78l-31.988-31.988c-7.757-8.141-8.821-20.568-2.559-29.909 c53.532-81.09,31.188-190.225-49.901-243.757S82.699-2.061,29.167,79.028S-2.022,269.253,79.068,322.785 c58.786,38.809,135.061,38.809,193.855,0c9.34-6.262,21.768-5.198,29.909,2.559l31.988,31.988L357.372,334.78z M176.08,320.066 c-79.498,0-143.946-64.448-143.946-143.946S96.582,32.174,176.08,32.174S320.026,96.622,320.026,176.12 S255.578,320.066,176.08,320.066z" />
              <path style={{ fill: 'lightblue' }} d="M480.925,461.693c-18.777,15.018-45.823,13.611-62.936-3.279l-93.165-91.006 c-6.414,6.43-6.414,16.842,0,23.271L441.34,507.196c6.43,6.414,16.842,6.414,23.271,0l42.144-42.144 c0.704-0.712,1.352-1.487,1.919-2.319c2.711-4.398,1.343-10.164-3.055-12.875c-3.471-2.143-7.933-1.783-11.02,0.88L480.925,461.693z" />
              <path style={{ fill: '#253647' }} d="M327.303,168.123c-8.181,84.216-74.98,150.775-159.22,158.66c-10.38,0.904-20.808,0.904-31.188,0 c-5.438-0.616-10.356,3.295-10.972,8.741c-0.568,5.006,2.703,9.636,7.613,10.772c94.277,23.511,189.769-33.859,213.272-128.136 c9.029-36.202,6.31-74.34-7.749-108.895c-1.919-3.975-6.701-5.646-10.676-3.727c-3.151,1.519-4.942,4.91-4.438,8.365 C327.831,131.696,328.966,149.986,327.303,168.123z" />
            </svg>            
            <p>Explore our vast collection of games, from classics to modern favorites, all risk-free!</p>
          </div>
          <div className="main-games">
            <div className="roulette-card">
              <div className="main-game-items">
                <h3>Roulette</h3>
                <button className="play-now-button" onClick={() => navigate('/roulette')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
              </div>
            </div>
            <div className="blackjack-card">
              <div className="main-game-items">
                <h3>Blackjack</h3>
                <button className="play-now-button" onClick={() => navigate('/blackjack')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
              </div>
            </div>
          </div>
        </div>
        <LiveBets bets={bets} />
      </div>
      <div className="games">
        <div className="plinko">
          <h3>Plinko</h3>
          <button className="play-now-button" onClick={() => navigate('/plinko')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
        </div>
        <div className="slots">
          <h3>Slots</h3>
          <button className="play-now-button" onClick={() => navigate('/slots')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
        </div>
        <div className="heads-or-tails">
          <h3>Heads or Tails</h3>
          <button className="play-now-button" onClick={() => navigate('/coinflip')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
        </div>
        <div className="crash">
          <h3>Crash</h3>
          <button className="play-now-button" onClick={() => navigate('/crash')}>PLAY NOW<FontAwesomeIcon icon={faAnglesRight} size="sm" style={{color: "#ffffff",}} /></button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 