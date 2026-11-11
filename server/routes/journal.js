import express from "express";
import Journals from "../models/Journals.js";

const router = express.Router();

/* ================= GET JOURNALS (FIX for data disappearing) ================= */
router.get("/", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ message: "User UID required" });

    // Fetch journals for this specific user, sorted by newest first
    const userJournals = await Journals.find({ uid }).sort({ date: -1 });
    res.json(userJournals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CREATE JOURNAL ================= */
router.post("/", async (req, res) => {
  try {
    const { uid, title, content, mood, date } = req.body;

    // Optional: Check for duplicate content/date if you want to restrict 1 per day
    // const existing = await Journals.findOne({ uid, date: date.split('T')[0] });
    // if (existing) return res.status(400).json({ message: "Journal already exists" });

    const journal = new Journals({
      uid,
      title: title || "Untitled", // Ensure title is saved
      content,
      mood: mood || "neutral", // Ensure mood is saved
      date,
    });

    await journal.save();
    res.status(201).json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE JOURNAL ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Journals.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
