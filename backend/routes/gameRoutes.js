const express = require('express');
const router = express.Router();
const pool = require('../db/config');

router.post('/update-balance', async (req, res) => {
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

router.post('/update-bet-stats', async (req, res) => {
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

router.post('/process-roulette-bets', async (req, res) => {
    try {
        const { userId, totalBetAmount, bets } = req.body;
        
        if (!userId || !bets || totalBetAmount === undefined) {
            return res.status(400).json({ 
                message: 'Missing required fields'
            });
        }

        // First deduct the total bet amount
        const deductBalance = await pool.query(
            'UPDATE user_details SET balance = balance - $1 WHERE id = $2 RETURNING balance',
            [totalBetAmount, userId]
        );

        if (deductBalance.rowCount === 0) {
            return res.status(404).json({ message: 'Failed to update balance' });
        }

        // Store the bet information in a new table for persistence
        const storeBets = await pool.query(
            'INSERT INTO active_roulette_bets (user_id, bets, total_amount, timestamp) VALUES ($1, $2, $3, NOW())',
            [userId, JSON.stringify(bets), totalBetAmount]
        );

        res.json({ 
            message: 'Bets processed successfully',
            newBalance: deductBalance.rows[0].balance
        });
    } catch (error) {
        console.error('Error processing roulette bets:', error);
        res.status(500).json({ message: 'Server error while processing bets' });
    }
});

router.post('/resolve-roulette-spin', async (req, res) => {
    try {
        const { userId, winAmount, won } = req.body;

        // Update balance if there are winnings
        if (winAmount > 0) {
            await pool.query(
                'UPDATE user_details SET balance = balance + $1 WHERE id = $2',
                [winAmount, userId]
            );
        }

        // Update bet statistics
        await pool.query(
            `UPDATE user_details SET bets_${won ? 'won' : 'lost'} = bets_${won ? 'won' : 'lost'} + 1 WHERE id = $1`,
            [userId]
        );

        // Clear active bets
        await pool.query(
            'DELETE FROM active_roulette_bets WHERE user_id = $1',
            [userId]
        );

        const userData = await pool.query(
            'SELECT balance, bets_won, bets_lost FROM user_details WHERE id = $1',
            [userId]
        );

        res.json({
            message: 'Spin resolved successfully',
            userData: userData.rows[0]
        });
    } catch (error) {
        console.error('Error resolving roulette spin:', error);
        res.status(500).json({ message: 'Server error while resolving spin' });
    }
});

module.exports = router;
