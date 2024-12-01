const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.EXTERNAL_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const connectWithRetry = async () => {
  try {
    await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
  } catch (err) {
    console.error('Database connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

module.exports = pool; 