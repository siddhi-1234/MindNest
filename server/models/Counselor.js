const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true, // Firebase UID
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: "https://i.pravatar.cc/150", // Default avatar if none provided
  },
  tags: {
    type: [String], // Array of strings like ["Anxiety", "Stress"]
    default: ["General Support"],
  },
  description: {
    type: String,
    default: "Dedicated professional ready to help students succeed.",
  },
  role: {
    type: String,
    default: "counselor",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  schedule: { type: Object, default: {} },
});

module.exports = mongoose.model("Counselor", counselorSchema);
