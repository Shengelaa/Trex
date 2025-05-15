import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, score } = req.body;

    // Get the current leaderboard or empty array
    let leaderboard = (await kv.get("leaderboard")) || [];

    leaderboard.push({ name, score });

    // Keep only top 3
    leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 3);

    // Save it back
    await kv.set("leaderboard", leaderboard);

    return res.status(200).json({ message: "Score saved", leaderboard });
  } else if (req.method === "GET") {
    const leaderboard = (await kv.get("leaderboard")) || [];
    return res.status(200).json(leaderboard);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
