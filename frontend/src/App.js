import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Roulette from './pages/Roulette';
import Blackjack from './pages/Blackjack';
import Slots from './pages/Slots';
import Plinko from './pages/Plinko';
import Crash from './pages/Crash';
import HeadsOrTails from './pages/HeadsOrTails';
import Footer from './components/Footer';
import Leaderboard from './components/Leaderboard';
import { connectSocket, disconnectSocket } from './services/socket';

function App() {
  const [hideFooter, setHideFooter] = useState(false);

  useEffect(() => {

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Add buffer time (5 minutes) before expiration
        if (decodedToken.exp < currentTime + 300) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    const checkUserData = () => {
      if (window.isBetProcessing) return Promise.resolve();
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) return Promise.resolve();

      const userId = JSON.parse(user).id;
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? `https://fakecasinowebsite.onrender.com/api/user/user/${userId}` 
        : `http://localhost:3001/api/user/user/${userId}`;

      return fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Invalid response');
          return response.json();
        })
        .then(userData => {
          localStorage.setItem('user', JSON.stringify(userData));
          window.dispatchEvent(new Event('balanceUpdate'));
        })
        .catch(error => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.error('Error refreshing user data:', error);
        });
    };

    checkTokenExpiration();
    connectSocket();
    checkUserData();

    const intervalId = setInterval(checkUserData, 5000);
  
    return () => {
      disconnectSocket();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/roulette" element={<Roulette setHideFooter={setHideFooter} />} />
            <Route path="/blackjack" element={<Blackjack />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/plinko" element={<Plinko />} />
            <Route path="/crash" element={<Crash />} />
            <Route path="/coinflip" element={<HeadsOrTails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </Router>
  );
}

export default App;
