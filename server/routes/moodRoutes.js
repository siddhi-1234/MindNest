const express = require("express");
const router = express.Router();
const Mood = require("../models/mood"); // Imported as 'Mood' (The Database Model)

// Add a new mood entry
router.post("/log", async (req, res) => {
  try {
    // 1. Get data from Frontend
    const { userId, mood, note } = req.body;

    // 2. Generate "Today" automatically (YYYY-MM-DD)
    // This fixes the issue where frontend wasn't sending a date
    const today = new Date().toISOString().split("T")[0];

    // 3. FIX: Use 'Mood' (Capital M) to check database
    const existing = await Mood.findOne({ userId, date: today });

    if (existing) {
      return res.status(400).json({ message: "Mood already logged today" });
    }

    // 4. FIX: Use 'new Mood' (Capital M) to create entry
    const newMood = new Mood({
      userId,
      mood, // This uses the lowercase 'mood' variable from req.body
      note,
      date: today, // Save our generated date
    });

    await newMood.save();
    res.status(201).json({ message: "Mood saved successfully" });
  } catch (error) {
    console.error("Save Error:", error); // Print error to terminal for debugging
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// Get last 7 days moods
router.get("/last7/:userId", async (req, res) => {
  try {
    // 5. FIX: Use 'Mood' (Capital M) to find data
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(7);

    res.json(moods);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

module.exports = router;
