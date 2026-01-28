const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post("/", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   GET /api/appointments
// @desc    Get ALL appointments (used for checking availability & history)
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
