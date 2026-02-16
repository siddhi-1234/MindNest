import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isCrisisActive: { type: Boolean, default: false }, // Track if student is in crisis
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Student", studentSchema);
