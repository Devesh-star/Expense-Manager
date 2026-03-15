const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===============================
// 🔐 Environment Safety Check
// ===============================
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  Warning: JWT_SECRET not set in environment variables!');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ===============================
// 🧩 Signup Route
// ===============================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email, and password.' });

    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email is already registered.' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyLimit: user.monthlyLimit || 0
      }
    });
  } catch (err) {
    console.error('Signup Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===============================
// 🔓 Login Route
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password.' });

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyLimit: user.monthlyLimit || 0
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
