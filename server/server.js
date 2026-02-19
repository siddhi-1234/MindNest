import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import connectDB from "./config/db.js";
import moodRoutes from "./routes/moodRoutes.js";
import journalRoutes from "./routes/journal.js";
import counselorRoutes from "./routes/counselorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import Student from "./models/Student.js";

const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer");
const { WebhookClient, Payload } = require("dialogflow-fulfillment");
const dialogflow = require("dialogflow");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use(express.json());

// ================= EMAIL CONFIGURATION =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID;
const CREDENTIALS_PATH = path.join(__dirname, process.env.DIALOGFLOW_KEY_FILE);

// ================= NEW ROUTE: SAVE STUDENT ON SIGNUP =================
// ✅ FEATURE 1: Endpoint called by frontend when a student registers
app.post("/api/students", async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    // Check if student exists
    const existing = await Student.findOne({ email });
    if (existing) return res.status(200).json(existing);

    const newStudent = new Student({ uid, name, email });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ error: "Failed to save student" });
  }
});

// ================= EMAIL ROUTES =================
app.post("/api/send-email", async (req, res) => {
  const { email, subject, message } = req.body;
  const mailOptions = {
    from: `"MindNest Counselor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: message,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/send-email-with-attachments", async (req, res) => {
  const { email, subject, message, attachments } = req.body;
  const mailOptions = {
    from: `"MindNest Counselor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: message,
    attachments: attachments || [],
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ================= ROUTES MOUNTING =================
app.use("/api/mood", moodRoutes);
app.use("/api/Journals", journalRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("MindNest Backend is Running...");
});

// ================= CHATBOT & DIALOGFLOW LOGIC =================
const cleanGoogleData = (field) => {
  if (!field) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.numberValue !== undefined) return field.numberValue;
  if (field.boolValue !== undefined) return field.boolValue;
  if (field.listValue) return field.listValue.values.map(cleanGoogleData);
  if (field.structValue) {
    const obj = {};
    for (const key in field.structValue.fields) {
      obj[key] = cleanGoogleData(field.structValue.fields[key]);
    }
    return obj;
  }
  return field;
};

app.post("/api/chat", async (req, res) => {
  const { text, sessionId } = req.body;
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: CREDENTIALS_PATH,
  });
  const sessionPath = sessionClient.sessionPath(
    PROJECT_ID,
    sessionId || uuidv4(),
  );

  const request = {
    session: sessionPath,
    queryInput: { text: { text: text, languageCode: "en-US" } },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    let finalPayloads = [];
    if (result.fulfillmentMessages) {
      result.fulfillmentMessages.forEach((msg) => {
        if (msg.payload && msg.payload.fields) {
          finalPayloads.push({
            payload: cleanGoogleData({ structValue: msg.payload }),
          });
        } else {
          finalPayloads.push(msg);
        }
      });
    }
    const textMsg = result.fulfillmentMessages?.find(
      (m) => m.text && m.text.text,
    );
    const replyText = textMsg ? textMsg.text.text[0] : result.fulfillmentText;
    res.json({ reply: replyText, payload: finalPayloads });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.status(500).json({ reply: "Connection error.", payload: [] });
  }
});

app.post("/dialogflow", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  const handleCrisis = (agent) => {
    agent.add("Your safety is the most important thing. Please get help.");
    // Optional: Log crisis from chatbot interactions here too if needed
  };

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", (agent) =>
    agent.add("Hi! I'm MindNest AI."),
  );
  intentMap.set("Default Fallback Intent", (agent) =>
    agent.add("I'm here with you."),
  );
  intentMap.set("Crisis_Alert", handleCrisis);
  agent.handleRequest(intentMap);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
