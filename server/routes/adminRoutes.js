import express from "express";
import Admin from "../models/Admin.js";
import Counselor from "../models/Counselor.js";
import Student from "../models/Student.js";
import Crisis from "../models/Crisis.js";

const router = express.Router();

// ================= ADMIN SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin account already exists." });
    }

    const newAdmin = new Admin({
      uid,
      name,
      email,
      status: "Pending",
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
// ✅ FEATURE 1 & 2: Return real counts for students and crisis alerts
router.get("/stats", async (req, res) => {
  try {
    // 1. Real Count of Students
    const studentCount = await Student.countDocuments();

    // 2. Real Count of Verified Counselors
    const counselorCount = await Counselor.countDocuments({
      status: "Verified",
    });

    // 3. Real Count of Crisis Alerts (Total records in Crisis collection)
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

// ================= NEW ROUTE: LOG CRISIS =================
// ✅ FEATURE 2: API to record when a student clicks an emergency button
router.post("/crisis", async (req, res) => {
  try {
    const { type } = req.body; // e.g., "911_Call", "Quick_Calm"
    const newCrisis = new Crisis({
      type,
      timestamp: new Date(),
    });
    await newCrisis.save();
    res.status(201).json({ message: "Crisis recorded" });
  } catch (error) {
    console.error("Crisis Log Error:", error);
    res.status(500).json({ message: "Error logging crisis" });
  }
});

// ================= GET COUNSELOR APPLICATIONS =================
router.get("/counselors", async (req, res) => {
  try {
    const counselors = await Counselor.find().sort({
      status: 1, // Pending first
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
    const { status } = req.body;
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

// ================= UPDATE ADMIN PROFILE =================
// Route: PUT /api/admin/:uid
router.put("/:uid", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find admin by UID and update
    const updatedAdmin = await Admin.findOneAndUpdate(
      { uid: req.params.uid },
      { name, email },
      { new: true }, // Return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(updatedAdmin);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ================= ADMIN LOGIN / CHECK STATUS =================
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const admin = await Admin.findOne({ uid });

    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found." });
    }

    admin.lastLogin = new Date();
    await admin.save();

    res.json(admin);
  } catch (error) {
    console.error("Login Fetch Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
