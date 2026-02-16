import express from "express";
import Counselor from "../models/Counselor.js"; // Ensure .js extension

const router = express.Router();

// ================= CREATE NEW COUNSELOR (Signup) =================
router.post("/", async (req, res) => {
  try {
    const { uid, name, title, email, image, tags, description, license } =
      req.body;

    // 1. Check if counselor exists by email
    let counselor = await Counselor.findOne({ email });
    if (counselor) {
      return res.status(400).json({ msg: "Counselor already exists" });
    }

    // 2. Create new instance
    counselor = new Counselor({
      uid,
      name,
      title,
      email,
      image,
      tags, // Array of specialties
      description,
      license, // Added license field
    });

    // 3. Save to DB
    await counselor.save();
    res
      .status(201)
      .json({ msg: "Counselor profile created successfully", counselor });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ================= GET ALL COUNSELORS =================
router.get("/", async (req, res) => {
  try {
    const counselors = await Counselor.find().sort({ createdAt: -1 });
    res.json(counselors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ================= UPDATE COUNSELOR (Settings & Schedule) =================
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    // We destructure possible fields. 'schedule' comes from Availability page, others from Settings page.
    const { name, title, license, description, tags, schedule } = req.body;

    // 1. Unique License Check (Only if license is being updated)
    if (license) {
      const existingLicense = await Counselor.findOne({ license });
      // If a counselor is found with this license, AND it's not the current user -> Error
      if (existingLicense && existingLicense.uid !== uid) {
        return res
          .status(400)
          .json({
            message: "License number already in use by another counselor.",
          });
      }
    }

    // 2. Build Update Object dynamically
    // This allows us to update JUST the schedule OR JUST the profile without erasing the other
    const updateFields = {};
    if (name) updateFields.name = name;
    if (title) updateFields.title = title;
    if (license) updateFields.license = license;
    if (description) updateFields.description = description;
    if (tags) updateFields.tags = tags;
    if (schedule) updateFields.schedule = schedule;

    // 3. Find and Update
    const counselor = await Counselor.findOneAndUpdate(
      { uid: uid },
      { $set: updateFields },
      { new: true, upsert: true }, // upsert creates it if missing (safety net)
    );

    if (!counselor) {
      return res.status(404).json({ msg: "Counselor not found" });
    }

    res.json(counselor);
  } catch (err) {
    console.error("Error updating counselor:", err);
    res.status(500).send("Server Error");
  }
});

export default router;
