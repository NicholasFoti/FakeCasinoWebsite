const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/update-avatar', authenticateToken, async (req, res) => {
    try {
        const { userId, avatarId } = req.body;

        await pool.query('UPDATE user_details SET avatar_id = $1 WHERE id = $2 RETURNING avatar_id', [avatarId, userId]);

        res.json({ message: 'Avatar updated successfully', avatarId });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Failed to update avatar' });
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

router.get('/user/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const userResult = await pool.query(
        'SELECT id, username, balance, date_created, bets_won, bets_lost, total_winnings, total_losses FROM user_details WHERE id = $1',
        [id]
      );
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(userResult.rows[0]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Server error while fetching user data' });
    }
});
  

module.exports = router;

