// api/scores.js

let leaderboard = [];

module.exports = (req, res) => {
  if (req.method === "POST") {
    const { name, score } = req.body;

    // Save the score to the leaderboard
    leaderboard.push({ name, score });

    // Sort leaderboard and keep only the top 3 scores
    leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

    // Send a response back to the client
    return res.status(200).json({ message: "Score saved", leaderboard });
  } else if (req.method === "GET") {
    return res.status(200).json(leaderboard); // Return the top 3 scores
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};
