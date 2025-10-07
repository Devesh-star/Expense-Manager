import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error(err));

// Schemas
const User = mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
}));

const Expense = mongoose.model("Expense", new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now }
}));

// Routes
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });
        await new User({ name, email, password }).save();
        res.json({ message: "Account created successfully!" });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
        return res.status(401).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful!", user });
});

app.post("/api/expense/add", async (req, res) => {
    const { userId, title, amount, category } = req.body;
    await new Expense({ userId, title, amount, category }).save();
    res.json({ message: "Expense added successfully!" });
});

app.get("/api/expense/:userId", async (req, res) => {
    const expenses = await Expense.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(expenses);
});

app.delete("/api/expense/:id", async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully!" });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
