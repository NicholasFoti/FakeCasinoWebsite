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

module.exports = router;
