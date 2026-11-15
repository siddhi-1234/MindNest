import express from "express";
import Counselor from "../models/Counselor.js"; // Ensure .js extension

const router = express.Router();

// ================= CREATE NEW COUNSELOR (Signup) =================
router.post("/", async (req, res) => {
  try {
    const { uid, name, title, email, image, tags, description, license } =
      req.body;

    // Basic validation - fail fast with a clear message instead of a
    // confusing Mongoose ValidationError / 500 later.
    if (!uid || !name || !title || !email) {
      return res
        .status(400)
        .json({ msg: "Missing required fields: uid, name, title, email." });
    }

    // Check if counselor already exists by email OR uid (covers the case
    // where a Firebase account exists but no profile was ever saved).
    let counselor = await Counselor.findOne({ $or: [{ email }, { uid }] });
    if (counselor) {
      return res.status(400).json({ msg: "Counselor already exists" });
    }

    counselor = new Counselor({
      uid,
      name,
      title,
      email,
      image,
      tags,
      description,
      license: license || undefined, // avoid saving "" into a sparse-unique field
    });

    await counselor.save();
    res
      .status(201)
      .json({ msg: "Counselor profile created successfully", counselor });
  } catch (err) {
    console.error(err);

    // Duplicate key race (e.g. email/uid/license collided at DB level)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res
        .status(400)
        .json({ msg: `A counselor with this ${field} already exists.` });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }

    res.status(500).json({ msg: "Server Error" });
  }
});

// ================= GET ALL COUNSELORS =================
router.get("/", async (req, res) => {
  try {
    const counselors = await Counselor.find().sort({ createdAt: -1 });
    res.json(counselors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ================= UPDATE COUNSELOR (Settings & Schedule) =================
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, title, license, description, tags, schedule } = req.body;

    // Unique License Check (Only if license is being updated)
    if (license) {
      const existingLicense = await Counselor.findOne({ license });
      if (existingLicense && existingLicense.uid !== uid) {
        return res.status(400).json({
          message: "License number already in use by another counselor.",
        });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (title) updateFields.title = title;
    if (license) updateFields.license = license;
    if (description) updateFields.description = description;
    if (tags) updateFields.tags = tags;
    if (schedule) updateFields.schedule = schedule;

    const counselor = await Counselor.findOneAndUpdate(
      { uid: uid },
      { $set: updateFields },
      { new: true, upsert: true },
    );

    if (!counselor) {
      return res.status(404).json({ msg: "Counselor not found" });
    }

    res.json(counselor);
  } catch (err) {
    console.error("Error updating counselor:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res
        .status(400)
        .json({ msg: `A counselor with this ${field} already exists.` });
    }

    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;
