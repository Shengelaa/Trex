// Import dependencies
const express = require("express");
const cors = require("cors");

// Create an Express app
const app = express();

// Use middleware
app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

// Initialize leaderboard (for demonstration purposes, this is in-memory)
let leaderboard = [];

// Handle POST request to save score
app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;

  // Save the score to the leaderboard
  leaderboard.push({ name, score });

  // Sort leaderboard and keep only the top 3 scores
  leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

  // Send a response back to the client
  res.status(200).json({ message: "Score saved", leaderboard });
});

// Handle GET request to fetch leaderboard
app.get("/api/scores", (req, res) => {
  res.status(200).json(leaderboard); // Return the top 3 scores
});

// Export the app as a serverless function
module.exports = app;
