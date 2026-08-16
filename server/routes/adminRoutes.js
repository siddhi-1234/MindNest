import express from "express";
import Admin from "../models/Admin.js";
import Counselor from "../models/Counselor.js";
import Student from "../models/Student.js";
import Crisis from "../models/Crisis.js";

const router = express.Router();

// ================= ADMIN SIGNUP: DISABLED =================
// Admin signup has been intentionally removed - there is exactly one
// admin account, managed directly in the database. This route is kept
// commented out (rather than just removed from the frontend) so that
// even someone who discovers POST /api/admin/signup cannot create a new
// admin account through the API.
//
// router.post("/signup", async (req, res) => { ... });

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
// Accepts an optional ?email= query param used only to self-heal a stale
// uid (see below). The uid in the URL still comes from a Firebase ID the
// client already authenticated as, so this cannot be used to look up an
// arbitrary admin by guessing an email.
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { email } = req.query;

    let admin = await Admin.findOne({ uid });

    // Self-heal: no document matches this Firebase uid. This happens when
    // the Firebase Auth account for this email was deleted and recreated
    // at some point (console cleanup, redoing a failed signup, etc.) -
    // Firebase issues a brand new uid for the same email, but the old
    // MongoDB document keeps the old uid, so lookups by uid stop matching
    // even though the account "already exists" by email.
    //
    // The caller only reaches this route after a successful Firebase
    // signInWithEmailAndPassword for this exact uid, so if we find an
    // existing record under the same email, it's safe to re-link it to
    // the current uid rather than telling the user their profile is
    // missing (and then telling them it already exists on signup).
    if (!admin && email) {
      const staleAdmin = await Admin.findOne({ email });
      if (staleAdmin) {
        staleAdmin.uid = uid;
        admin = await staleAdmin.save();
      }
    }

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
