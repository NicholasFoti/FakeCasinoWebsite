  //////////////////////////////
  //      API CALLS          //
  //////////////////////////////

// Update balance in database
export async function updateBalance(amount) {
    const numericAmount = Number(Number(amount).toFixed(2));
    
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-balance' : 'http://localhost:3001/api/game/update-balance';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: JSON.parse(localStorage.getItem('user')).id,
        amount: numericAmount,
      })
    });
    return response;
};

// Update bet stats in database
export async function updateBetStats(won) {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-bet-stats' : 'http://localhost:3001/api/game/update-bet-stats';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                userId: JSON.parse(localStorage.getItem('user')).id,
                won: won
            })
        });
        
        if (response.ok) {
            const userData = await response.json();
            const user = JSON.parse(localStorage.getItem('user'));
            user.bets_won = userData.stats.bets_won;
            user.bets_lost = userData.stats.bets_lost;
            localStorage.setItem('user', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Error updating bet stats:', error);
    }
};

// Update winnings in database
export async function updateWinnings(winAmount, lossAmount) {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/update-winnings' : 'http://localhost:3001/api/game/update-winnings';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('user')).id, winAmount, lossAmount })
    });
    return response;
};

//Add recent bet to database
export async function addRecentBet(gameType, betAmount, betProfit, won) {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/game/add-recent-bet' : 'http://localhost:3001/api/game/add-recent-bet';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: JSON.parse(localStorage.getItem('user')).id,
        gameType,
        betAmount,
        betProfit,
        won
      })
    });
    return response;
}
