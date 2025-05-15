// backend/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URL (make sure to replace <username>, <password>, and <dbname> with your actual values)
const mongoUri = "mongodb+srv://admin:levanme99@cluster0.1pw4f.mongodb.net/leaderboard?retryWrites=true&w=majority";

// Connect to MongoDB without deprecated options
mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Define the leaderboard schema for MongoDB
const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
});

// Create the leaderboard model
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// In-memory leaderboard (this will be reset every time the server restarts)
let leaderboard = [];

app.post("/api/scores", async (req, res) => {
  const { name, score } = req.body;

  try {
    // Save the new score to MongoDB
    const newScore = new Leaderboard({ name, score });
    await newScore.save(); // Save the score to MongoDB

    // Add the score to the in-memory leaderboard
    leaderboard.push({ name, score });

    // Sort in-memory leaderboard and keep the top 3
    leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

    // Retrieve the top 3 scores from MongoDB
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(3);

    res.status(200).json({ message: "Score saved", leaderboard: topScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving score", error: err });
  }
});

app.get("/api/scores", async (req, res) => {
  try {
    // Retrieve the top 3 scores from MongoDB
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(3);
    
    // Sort the in-memory leaderboard and keep the top 3
    const topScoresFromMemory = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

    res.status(200).json({
      leaderboardFromMemory: topScoresFromMemory,
      leaderboardFromDb: topScores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving scores", error: err });
  }
});

module.exports = app; // Ensure this exports the app
