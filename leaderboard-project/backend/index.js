const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (without deprecated options)
mongoose
  .connect(
    "mongodb+srv://admin:<levanme99>@cluster0.1pw4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define schema and model for leaderboard scores
const scoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const Score = mongoose.model("Score", scoreSchema);

// POST: Save a new score
app.post("/api/scores", async (req, res) => {
  const { name, score } = req.body;

  console.log("Received request with name:", name, "and score:", score); // Log the incoming request data

  // Basic validation check
  if (!name || !score) {
    return res.status(400).json({ error: "Both name and score are required" });
  }

  try {
    console.log("Saving score to MongoDB...");
    // Save new score to MongoDB
    const newScore = new Score({ name, score });
    await newScore.save();

    console.log("Score saved successfully.");

    // Get top 3 scores
    const topScores = await Score.find().sort({ score: -1 }).limit(3);
    console.log("Top scores:", topScores);

    res.status(200).json({ message: "Score saved", leaderboard: topScores });
  } catch (error) {
    console.error("Error saving score:", error); // Log full error details
    res.status(500).json({
      error: "Failed to save score",
      details: error.message,
      stack: error.stack,
    });
  }
});

// GET: Get top 3 scores
app.get("/api/scores", async (req, res) => {
  try {
    // Fetch top 3 scores from MongoDB
    const topScores = await Score.find().sort({ score: -1 }).limit(3);
    res.status(200).json(topScores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
