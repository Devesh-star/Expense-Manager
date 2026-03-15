// controllers/expenseController.js
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

exports.createExpense = async (req, res) => {
  try {
    const { description, category, amount, date } = req.body;
    if (!description || !category || amount == null) return res.status(400).json({ message: 'Missing fields' });

    const expense = await Expense.create({
      user: req.user.id,
      description,
      category,
      amount,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    // optional category filter via query ?category=Food
    const filter = { user: req.user.id };
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;

    // optionally paginate later
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper endpoint: totals & category counts
exports.summary = async (req, res) => {
  try {
    const userId = req.user.id;
    const match = { user: require('mongoose').Types.ObjectId(userId) };

    const agg = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // total monthly sum (for current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const monthlyAgg = await Expense.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId), date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyTotal = (monthlyAgg[0] && monthlyAgg[0].total) || 0;

    res.json({ byCategory: agg, monthlyTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
