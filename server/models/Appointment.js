const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  studentUid: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },

  counselorId: { type: String, required: true }, // Links to Counselor UID
  counselorName: { type: String, required: true },
  counselorImage: { type: String },

  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: 09:00 AM

  sessionType: { type: String },
  concern: { type: String },
  note: { type: String },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
