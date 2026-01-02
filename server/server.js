import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Function to connect to MongoDB
import moodRoutes from "./routes/moodRoutes.js"; // Import mood routes for handling mood-related API
import journalRoutes from "./routes/journal.js"; //Import journal routes for handling journal-related API

// Load .env file
dotenv.config();

// Connect to MongoDB
connectDB();

//initializes your server application
const app = express();

// Middlewares
app.use(cors()); //Enables frontend
app.use(express.json()); //Automatically parses JSON bodies sent from the client

// Test Route
app.get("/", (req, res) => {
  res.send("MindNest Backend is Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//For testing in thunder client
app.get("/test-db", async (req, res) => {
  try {
    res.json({ message: "Database connection is working!" });
  } catch (err) {
    res.status(500).json({ message: "Error", err });
  }
});

app.use(express.json()); // Essential to read req.body
app.use("/api/mood", moodRoutes); // Connects the route file

app.use("/api/Journals", journalRoutes); // Connects the journal route file
