import express from "express";
import Appointment from "../models/Appointment.js";
const router = express.Router();

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

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!appointment)
      return res.status(404).json({ msg: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
