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

app.get('/api/online-connections', (req, res) => {
  try {
    res.json({ connections: connectedUsers.size });
  } catch (error) {
    console.error('Error fetching online connections:', error);
    res.status(500).json({ message: 'Failed to fetch online connections' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// Socket.io connection
const connectedUsers = new Set();

io.on('connection', (socket) => {
  connectedUsers.add(socket.id);
  io.emit('updateConnections', connectedUsers.size);

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', {
      username: msg.username,
      text: msg.text,
      timestamp: msg.timestamp
    });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    io.emit('updateConnections', connectedUsers.size);
  });

  // Send current game state to new connections
  socket.emit('roulette_state', gameState);
  
  socket.on('place_bet', (betData) => {
    const { color, amount, username } = betData;
    if (!gameState.currentBets[color][username]) {
      gameState.currentBets[color][username] = 0;
    }
    gameState.currentBets[color][username] += amount;
    
    // Calculate totals for the color
    const totalAmount = Object.values(gameState.currentBets[color]).reduce((sum, bet) => sum + bet, 0);
    const totalBetters = Object.keys(gameState.currentBets[color]).length;
    
    // Sort bets by amount in descending order
    const sortedBets = Object.entries(gameState.currentBets[color])
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});
    
    // Emit detailed bet information to all clients
    io.emit('bet_update', {
      color,
      bets: sortedBets,
      totalAmount,
      totalBetters
    });
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

const gameState = {
  countdown: 10,
  spinning: false,
  previousRolls: [],
  currentBets: {
    red: {},
    black: {},
    green: {}
  },
  currentSpin: {
    inProgress: false,
    number: null,
    startTime: null,
    duration: 13000
  },
  lastUpdated: Date.now()
};

let gameInterval;

const startGameLoop = () => {
  gameInterval = setInterval(() => {
    if (!gameState.spinning) {
      if (gameState.countdown > 0) {
        gameState.countdown -= 1;
        io.emit('roulette_state', gameState);
      }
      
      if (gameState.countdown <= 0) {
        gameState.spinning = true;
        const result = Math.floor(Math.random() * 37);
        gameState.currentSpin = {
          inProgress: true,
          number: result,
          startTime: Date.now(),
          duration: 13000
        };
        
        io.emit('roulette_state', gameState);
        io.emit('roll_result', {
          number: result,
          previousRolls: gameState.previousRolls,
          startTime: gameState.currentSpin.startTime
        });
        
        setTimeout(() => {
          gameState.previousRolls.unshift(result);
          if (gameState.previousRolls.length > 10) {
            gameState.previousRolls.pop();
          }
          
          gameState.spinning = false;
          gameState.countdown = 10;
          gameState.currentBets = { red: {}, black: {}, green: {} };
          gameState.currentSpin = {
            inProgress: false,
            number: null,
            startTime: null,
            duration: 13000
          };
          
          io.emit('roulette_state', gameState);
        }, 13000);
      }
    }
  }, 1000);
};

startGameLoop();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});