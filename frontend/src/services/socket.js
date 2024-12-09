import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fakecasinowebsite.onrender.com'
  : 'http://localhost:3001';

console.log('Initializing socket connection to:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
});

// Export connect/disconnect functions for manual control
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Add these after the existing socket setup
socket.on('roulette_state', (state) => {
  window.dispatchEvent(new CustomEvent('rouletteState', { detail: state }));
});

socket.on('new_bet', (betData) => {
  window.dispatchEvent(new CustomEvent('newBet', { detail: betData }));
});

socket.on('roll_result', (result) => {
  window.dispatchEvent(new CustomEvent('rollResult', { detail: result }));
});

export const emitBet = (betData) => {
  socket.emit('place_bet', betData);
};