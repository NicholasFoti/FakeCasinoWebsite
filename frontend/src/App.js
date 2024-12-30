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
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Your session has expired. Please login again.');
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
        }
      }
    };

    const checkUserData = async () => {
      //Dont check & update if a bet is processing.
      if (window.isBetProcessing) return;
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userId = JSON.parse(user).id;
          const apiUrl = process.env.NODE_ENV === 'production' ? `https://fakecasinowebsite.onrender.com/api/auth/user/${userId}` : `http://localhost:3001/api/auth/user/${userId}`;
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));
            window.dispatchEvent(new Event('balanceUpdate'));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } 
        catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
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
