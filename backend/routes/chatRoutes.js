const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// Fetch chat messages
router.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chat_messages ORDER BY timestamp ASC LIMIT 15');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send-message', async (req, res) => {
  const { username, text } = req.body;

  if (!username || !text) {
    return res.status(400).json({ error: 'Username and text are required' });
  }

  try {
    await pool.query('INSERT INTO chat_messages (username, text) VALUES ($1, $2)', [username, text]);
    res.status(200).json({ message: 'Message saved' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;