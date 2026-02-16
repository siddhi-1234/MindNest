import mongoose from "mongoose";

const crisisSchema = new mongoose.Schema({
  studentId: { type: String }, // Optional: Link to student if known
  type: {
    type: String,
    enum: ["911_Call", "988_Call", "Quick_Calm"],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Crisis", crisisSchema);
