import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

// Retrieve registered students for counselor email resolution
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({}, "uid name email").lean();
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Route 1: Save a new student (Called during Signup)
router.post("/", async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    // Check if user already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(200).json(existingStudent); // Return existing without error
    }

    const newStudent = new Student({ uid, name, email });
    await newStudent.save();

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
