import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Book a new counseling appointment
 * @access  Public / Student / Counselor
 */
router.post("/", async (req, res) => {
  try {
    // Instantiate new appointment document with data from request body (student, counselor, date, time, concern)
    const newAppointment = new Appointment(req.body);

    // Save the new appointment document to MongoDB
    const savedAppointment = await newAppointment.save();

    // Respond with 201 Created and return the newly saved appointment document
    res.status(201).json(savedAppointment);
  } catch (err) {
    // Log server error and return 500 status with error details
    console.error("Error booking appointment:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

/**
 * @route   GET /api/appointments
 * @desc    Retrieve all appointments (used for slot availability checks, counselor calendars, and history)
 * @access  Public / Authenticated
 */
router.get("/", async (req, res) => {
  try {
    // Query MongoDB for all appointments sorted in descending order by creation date (newest first)
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    // Respond with the list of appointments as a JSON array
    res.json(appointments);
  } catch (err) {
    // Log server error and return 500 response
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment status (e.g., 'confirmed', 'cancelled', 'completed')
 * @access  Counselor / Admin
 */
router.put("/:id", async (req, res) => {
  try {
    // Extract new status value from request payload
    const { status } = req.body;

    // Find appointment by its MongoDB ObjectId and update its status
    // { new: true } ensures the updated document is returned rather than the original
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    // If no matching appointment was found, return 404 Not Found
    if (!appointment)
      return res.status(404).json({ msg: "Appointment not found" });

    // Respond with the updated appointment document
    res.json(appointment);
  } catch (err) {
    // Log server error and return 500 response
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Export router instance to be mounted in the main Express application
export default router;
