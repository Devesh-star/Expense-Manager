require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Optional: serve frontend static build if you put the frontend build here
// app.use(express.static(path.join(__dirname, 'client', 'build')));
// app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
