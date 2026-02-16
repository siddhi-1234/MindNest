import express from "express";
import Admin from "../models/Admin.js";
import Counselor from "../models/Counselor.js";
import Student from "../models/Student.js";
import Crisis from "../models/Crisis.js";

const router = express.Router();

// ================= ADMIN SIGNUP =================
// Route: POST /api/admin/signup
// Expects: JSON { "name": "...", "email": "...", "uid": "..." }
router.post("/signup", async (req, res) => {
  try {
    const { name, email, uid } = req.body;

    // 1. Validate Input
    if (!name || !email || !uid) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin account already exists." });
    }

    // 3. Create new Admin (No document upload)
    const newAdmin = new Admin({
      uid,
      name,
      email,
      status: "Pending", // Default status is Pending approval
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin request submitted successfully. Pending approval.",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ================= ADMIN DASHBOARD STATS =================
router.get("/stats", async (req, res) => {
  try {
    // 1. Real Count of Students
    const studentCount = await Student.countDocuments();

    // 2. Real Count of Verified Counselors
    const counselorCount = await Counselor.countDocuments({
      status: "Verified",
    });

    // 3. Real Count of Crisis Alerts (Last 24 hours or Total)
    const crisisCount = await Crisis.countDocuments();

    res.json({
      students: studentCount,
      counselors: counselorCount,
      crisis: crisisCount,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// ================= GET COUNSELOR APPLICATIONS =================
router.get("/counselors", async (req, res) => {
  try {
    // Fetch all counselors, sorted by Pending status first
    const counselors = await Counselor.find().sort({
      status: 1,
      createdAt: -1,
    });
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching counselors" });
  }
});

// ================= UPDATE COUNSELOR STATUS =================
router.put("/counselor/:id/status", async (req, res) => {
  try {
    const { status } = req.body; // "Verified" or "Rejected"
    const updatedCounselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(updatedCounselor);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// ================= DELETE COUNSELOR =================
router.delete("/counselor/:id", async (req, res) => {
  try {
    await Counselor.findByIdAndDelete(req.params.id);
    res.json({ message: "Counselor removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting counselor" });
  }
});

// ================= ADMIN LOGIN / CHECK STATUS =================
// Route: GET /api/admin/:uid
// Used after Firebase login to check if the user is an Admin and if they are Verified
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const admin = await Admin.findOne({ uid });

    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found." });
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save();

    res.json(admin);
  } catch (error) {
    console.error("Login Fetch Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
