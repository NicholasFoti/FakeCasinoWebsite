const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/update-balance', authenticateToken, async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        console.log('Received request:', { userId, amount });

        if (!userId || amount === undefined) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { userId, amount }
            });
        }

        // First get the current balance
        const userResult = await pool.query(
            'SELECT balance FROM user_details WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert to numbers and fix to 2 decimal places
        const currentBalance = parseFloat(userResult.rows[0].balance);
        const amountNumber = parseFloat(amount);
        const newBalance = Math.round((currentBalance + amountNumber) * 100) / 100;

        console.log('Balance calculation:', { 
            currentBalance, 
            amountNumber, 
            newBalance 
        });

        // Update the balance using a parameterized query
        const updateBalance = await pool.query(
            'UPDATE user_details SET balance = $1 WHERE id = $2 RETURNING balance',
            [newBalance, userId]
        );

        if (updateBalance.rowCount === 0) {
            return res.status(404).json({ message: 'Failed to update balance' });
        }

        res.json({ 
            message: 'Balance updated successfully',
            newBalance: updateBalance.rows[0].balance
        });
    } catch (error) {
        console.error('Error in update-balance route:', error);
        res.status(500).json({ 
            message: 'Server error while updating balance',
            error: error.message
        });
    }
});

router.post('/update-bet-stats', authenticateToken, async (req, res) => {
    try {
        const { userId, won } = req.body;
        
        if (!userId || won === undefined) {
            return res.status(400).json({ 
                message: 'Missing required fields'
            });
        }

        const updateField = won ? 'bets_won' : 'bets_lost';
        const updateStats = await pool.query(
            `UPDATE user_details SET ${updateField} = ${updateField} + 1 WHERE id = $1 RETURNING bets_won, bets_lost`,
            [userId]
        );

        if (updateStats.rowCount === 0) {
            return res.status(404).json({ message: 'Failed to update bet stats' });
        }

        res.json({ 
            message: 'Bet stats updated successfully',
            stats: updateStats.rows[0]
        });
    } catch (error) {
        console.error('Error in update-bet-stats route:', error);
        res.status(500).json({ 
            message: 'Server error while updating bet stats'
        });
    }
});

router.post('/update-winnings', authenticateToken, async (req, res) => {
    const { userId, winAmount, lossAmount } = req.body;
    await pool.query('UPDATE user_details SET total_winnings = total_winnings + $1, total_losses = total_losses + $2 WHERE id = $3', [winAmount, lossAmount, userId]);

    res.json({ message: 'Winnings updated successfully' });
});

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboardData = await pool.query(
      'SELECT username, total_winnings, total_losses FROM user_details ORDER BY total_winnings - total_losses DESC LIMIT 10'
    );
    res.json({ leaders: leaderboardData.rows });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

router.get('/leaderboard/wins', async (req, res) => {
  try {
    const leaderboardData = await pool.query(
      'SELECT username, bets_won FROM user_details ORDER BY bets_won DESC LIMIT 10'
    );
    res.json({ leaders: leaderboardData.rows });
  } catch (error) {
    console.error('Error fetching wins leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching wins leaderboard' });
  }
});

router.get('/total-bets', async (req, res) => {
  try {
    const totalBets = await pool.query(`
      SELECT COALESCE(SUM(bets_won), 0) + COALESCE(SUM(bets_lost), 0) AS total_bets 
      FROM user_details
    `);
    res.json({ totalBets: totalBets.rows[0].total_bets });
  } catch (error) {
    console.error('Error fetching total bets:', error);
    res.status(500).json({ message: 'Server error while fetching total bets' });
  }
});

router.post('/add-recent-bet', authenticateToken, async (req, res) => {
  try {
    const { userId, gameType, betAmount, betProfit, won } = req.body;

    const result = await pool.query(
      'INSERT INTO recent_bets (user_id, game_type, bet_amount, bet_profit, won) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, gameType, betAmount, betProfit, won]
    );

    res.json({ message: 'Bet recorded successfully', bet: result.rows[0] });
  } catch (error) {
    console.error('Error recording bet:', error);
    res.status(500).json({ message: 'Server error while recording bet' });
  }
});

router.get('/recent-user-bets', authenticateToken, async (req, res) => {  
  try {
    const result = await pool.query(
      'SELECT game_type, bet_amount, bet_profit FROM recent_bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', 
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent bets:', error);
    res.status(500).json({ message: 'Server error while fetching recent bets' });
  }
});

router.get('/recent-bets', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT recent_bets.user_id, user_details.username, recent_bets.bet_amount, recent_bets.bet_profit FROM recent_bets 
      JOIN user_details ON recent_bets.user_id = user_details.id ORDER BY recent_bets.created_at DESC LIMIT 18`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent bets:', error);
    res.status(500).json({ message: 'Server error while fetching recent bets' });
  }
});

module.exports = router;
