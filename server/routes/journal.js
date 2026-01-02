import express from "express";
import Journals from "../models/Journals.js";

const router = express.Router();

/* ================= CREATE JOURNAL ================= */
router.post("/", async (req, res) => {
  try {
    const { uid, content, date } = req.body;

    // Prevent duplicate journal per day
    const existing = await Journals.findOne({ uid, date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Journal already exists for today" });
    }

    const journal = new Journals({ uid, content, date });
    await journal.save();

    res.status(201).json(journal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
