import express from "express";
import Mood from "../models/mood.js"; // Ensure file extension .js is present

const router = express.Router();

// Add a new mood entry
router.post("/log", async (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const existing = await Mood.findOne({ userId, date: today });

    if (existing) {
      return res.status(400).json({ message: "Mood already logged today" });
    }

    const newMood = new Mood({
      userId,
      mood,
      note,
      date: today,
    });

    await newMood.save();
    res.status(201).json({ message: "Mood saved successfully" });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// Get last 7 days moods
router.get("/last7/:userId", async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(7);

    res.json(moods);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

export default router;
