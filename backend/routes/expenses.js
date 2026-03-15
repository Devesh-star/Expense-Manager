const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');

// GET /api/expenses/ - list user's expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/expenses/ - add expense
router.post('/', auth, async (req, res) => {
  try {
    const { description, category, amount, date } = req.body;
    if (!description || !category || amount == null) return res.status(400).json({ message: 'Missing fields' });

    const expense = new Expense({
      user: req.user.id,
      description,
      category,
      amount,
      date: date ? new Date(date) : undefined
    });

    await expense.save();
    res.status(201).json({ expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/expenses/:id - delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/expenses/limit - set monthly limit
router.put('/limit', auth, async (req, res) => {
  try {
    const { monthlyLimit } = req.body;
    const user = await User.findById(req.user.id);
    user.monthlyLimit = monthlyLimit != null ? monthlyLimit : null;
    await user.save();
    res.json({ monthlyLimit: user.monthlyLimit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/expenses/summary - totals, counts
router.get('/summary', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const counts = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});
    const user = await User.findById(req.user.id);
    res.json({ total, counts, monthlyLimit: user.monthlyLimit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
