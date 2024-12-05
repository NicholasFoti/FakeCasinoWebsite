const express = require("express");
require("dotenv").config();
const path = require('path');
const http = require('http');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./db/config');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://fakecasinowebsite.onrender.com'
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/chat', chatRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err.code, err.message, err.context);
});

//Schedule cron job to delete chat messages older than 12 hours
cron.schedule('0 0 * * *', async () => {
  try{
    await pool.query('DELETE FROM chat_messages WHERE timestamp < NOW() - INTERVAL \'12 hours\'');
    console.log('Deleted chat messages older than 12 hours');
  } catch (error) {
    console.error('Error deleting chat messages:', error);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});