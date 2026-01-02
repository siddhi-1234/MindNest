import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true }, // Firebase UID
    content: { type: String, required: true }, // Journal entry content
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

export default mongoose.model("Journal", journalSchema);
