// backend/index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let leaderboard = [];

app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;
  leaderboard.push({ name, score });
  leaderboard = leaderboard.sort((a, b) => b.score - a.score).splice(0, 3);
  res.status(200).json({ message: "Score saved", leaderboard });
});

app.get("/api/scores", (req, res) => {
  res.status(200).json(leaderboard);
  console.log(leaderboard);
});

module.exports = app; // Make sure this is exporting the app
