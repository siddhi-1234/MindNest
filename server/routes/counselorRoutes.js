const express = require("express");
const router = express.Router();
const Counselor = require("../models/Counselor"); // Import the Model we just made

// Create/Save a new counselor (Used during Signup)
router.post("/", async (req, res) => {
  try {
    const { uid, name, title, email, image, tags, description } = req.body;

    // Check if counselor already exists
    let counselor = await Counselor.findOne({ email });
    if (counselor) {
      return res.status(400).json({ msg: "Counselor already exists" });
    }

    // Create new instance
    counselor = new Counselor({
      uid,
      name,
      title,
      email,
      image,
      tags,
      description,
    });

    // Save to DB
    await counselor.save();
    res
      .status(201)
      .json({ msg: "Counselor profile created successfully", counselor });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get all counselors (Used for the Appointments Page list)
router.get("/", async (req, res) => {
  try {
    const counselors = await Counselor.find().sort({ createdAt: -1 });
    res.json(counselors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:uid", async (req, res) => {
  try {
    const counselor = await Counselor.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: { schedule: req.body.schedule } },
      { new: true },
    );
    res.json(counselor);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
