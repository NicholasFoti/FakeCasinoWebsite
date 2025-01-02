import api from '../services/api';
 
 //////////////////////////////
  //      API CALLS          //
  //////////////////////////////

// Update balance in database
export async function updateBalance(amount) {
  const numericAmount = Number(Number(amount).toFixed(2));
  
  const { data } = await api.post('/api/game/update-balance', {
    userId: JSON.parse(localStorage.getItem('user')).id,
    amount: numericAmount,
  });
  return data;
};

// Update bet stats in database
export async function updateBetStats(won) {

  try {
    const { data } = await api.post('/api/game/update-bet-stats', {
      userId: JSON.parse(localStorage.getItem('user')).id,
      won: won
    });

    if (data) {
      const user = JSON.parse(localStorage.getItem('user'));
      user.bets_won = data.stats.bets_won;
      user.bets_lost = data.stats.bets_lost;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return data;
  } catch (error) {
    console.error('Error updating bet stats:', error);
  }
};

// Update winnings in database
export async function updateWinnings(winAmount, lossAmount) {
  const { data } = await api.post('/api/game/update-winnings', {
    userId: JSON.parse(localStorage.getItem('user')).id,
    winAmount,
    lossAmount
  });
  return data;
};

//Add recent bet to database
export async function addRecentBet(gameType, betAmount, betProfit, won) {

  const { data } = await api.post('/api/game/add-recent-bet', {
    userId: JSON.parse(localStorage.getItem('user')).id,
    gameType,
    betAmount,
    betProfit,
    won
  });
    
  if (data) {
    window.dispatchEvent(new Event('betPlaced'));
  }
  return data;
};
