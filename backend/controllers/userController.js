// controllers/userController.js
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.json(req.currentUser); // set in auth middleware
};

exports.setMonthlyLimit = async (req, res) => {
  try {
    const { limit } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { monthlyLimit: limit }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
