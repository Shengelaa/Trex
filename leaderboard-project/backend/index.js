// backend/index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

let leaderboard = [];

const discordWebhookUrl =
  "https://discord.com/api/webhooks/1372735668245233664/Ac7lsar5Hy4Jde2mCpEpinRf0leQi8vrF_Pw2BEWsH1uKQE1HWKtWhGnGJNOZ2hxRL2l"; // Replace with your actual Discord webhook URL

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
app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;
  leaderboard.push({ name, score });
  leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

  // Send the updated leaderboard to Discord only if there is a change
  sendLeaderboardToDiscord(leaderboard);

  res.status(200).json({ message: "Score saved", leaderboard });
});

app.get("/api/scores", (req, res) => {
  res.status(200).json(leaderboard);
  console.log(leaderboard);
});

module.exports = app;
