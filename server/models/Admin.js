import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // Links to Firebase Auth
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
    role: {
      type: String,
      default: "admin",
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending", // You can change this to "Verified" if you want auto-approval
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
