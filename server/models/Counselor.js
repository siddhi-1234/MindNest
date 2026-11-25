import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // Firebase UID
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true, // e.g. "Licensed Clinical Psychologist"
    },
    image: {
      type: String,
      default: "https://i.pravatar.cc/150?img=12", // Default avatar
    },
    // ✅ License: Unique but sparse (allows null/undefined for new accounts)
    license: {
      type: String,
      unique: true,
      sparse: true,
    },
    // ✅ Bio: This matches the "Professional Bio" on frontend
    description: {
      type: String,
      default: "Dedicated professional ready to help students succeed.",
    },
    // ✅ Specialty: The frontend treats the first tag as the "Primary Specialty"
    tags: {
      type: [String],
      default: ["General Support"],
    },
    specialization: { type: String, default: "General Counselor" },
    role: {
      type: String,
      default: "counselor",
    },
    // Stores availability: { "2023-10-25": ["10:00 AM", "11:00 AM"] }
    schedule: {
      type: Object,
      default: {},
    },
    bio: { type: String, default: "" },
    experience: { type: String, default: "0 years" },

    // Status Logic for Admin Dashboard
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    verificationDocument: { type: String }, // URL to uploaded ID
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Counselor", counselorSchema);
