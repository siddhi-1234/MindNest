import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    title: { type: String, default: "Untitled" }, // Added Title
    content: { type: String, required: true },
    mood: { type: String, default: "neutral" }, // Added Mood
    date: { type: String, required: true }, // Stored as ISO String
  },
  { timestamps: true },
);

export default mongoose.model("Journal", journalSchema);
