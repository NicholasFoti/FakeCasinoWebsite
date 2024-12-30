const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/config');

// Register Route
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT * FROM user_details WHERE username = $1',
            [username]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO user_details (username, password, balance, date_created, bets_won, bets_lost) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5) RETURNING *',
            [username, hashedPassword, 1000,0, 0]
        );

        // Create JWT token
        const token = jwt.sign(
            { userId: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                balance: newUser.rows[0].balance,
                date_created: newUser.rows[0].date_created,
                bets_won: newUser.rows[0].bets_won,
                bets_lost: newUser.rows[0].bets_lost
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM user_details WHERE username = $1',
            [username]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Username does not exist' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                balance: user.rows[0].balance,
                date_created: user.rows[0].date_created,
                bets_won: user.rows[0].bets_won,
                bets_lost: user.rows[0].bets_lost,
                total_winnings: user.rows[0].total_winnings,
                total_losses: user.rows[0].total_losses
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 