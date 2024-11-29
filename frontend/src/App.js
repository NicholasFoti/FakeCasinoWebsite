import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import GameList from './components/GameList';
import Roulette from './components/Roulette';
import Blackjack from './components/Blackjack';
import Slots from './components/Slots';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/roulette" element={<Roulette />} />
            <Route path="/blackjack" element={<Blackjack />} />
            <Route path="/slots" element={<Slots />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
