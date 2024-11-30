const express = require("express");
require("dotenv").config();
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});