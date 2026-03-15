require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB(process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Export app for Vercel
module.exports = app;