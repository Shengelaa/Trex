const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://admin:levanme99@cluster0.1pw4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

const app = express();
app.use(cors());
app.use(express.json());

const discordWebhookUrl = "YOUR_DISCORD_WEBHOOK_URL"; // Replace with your actual Discord webhook URL

// Function to send the leaderboard to Discord
const sendLeaderboardToDiscord = async (leaderboard) => {
  try {
    await axios.post(discordWebhookUrl, {
      content:
        `🏆 **Leaderboard** 🏆\n` +
        leaderboard
          .map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
          .join("\n"),
    });
  } catch (error) {
    console.error("Error sending to Discord:", error);
  }
};

// POST endpoint to save score and send the leaderboard to Discord if it changes
app.post("/api/scores", async (req, res) => {
  const { name, score } = req.body;

  const newScore = new Leaderboard({ name, score });

  try {
    // Save the new score
    await newScore.save();

    // Get top 3 scores, sorted by score in descending order
    const leaderboard = await Leaderboard.find().sort({ score: -1 }).limit(3);

    // Send updated leaderboard to Discord
    sendLeaderboardToDiscord(leaderboard);

    res.status(200).json({ message: "Score saved", leaderboard });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ message: "Error saving score" });
  }
});

// GET endpoint to retrieve leaderboard
app.get("/api/scores", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ score: -1 }).limit(3); // Get top 3 scores
    res.status(200).json(leaderboard); // Send as JSON
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

module.exports = app;
