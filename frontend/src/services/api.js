import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://fakecasinowebsite.onrender.com'
  : 'http://localhost:3001';

const api = axios.create({ 
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

