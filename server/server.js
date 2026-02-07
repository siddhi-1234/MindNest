import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module"; // ✅ Fix for old libraries

import connectDB from "./config/db.js";
import moodRoutes from "./routes/moodRoutes.js";
import journalRoutes from "./routes/journal.js";
import counselorRoutes from "./routes/counselorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

// === COMPATIBILITY SETUP ===
// This allows us to use 'require' for the Chatbot libraries inside this ESM file
const require = createRequire(import.meta.url);
const { WebhookClient, Payload } = require("dialogflow-fulfillment");
const dialogflow = require("dialogflow");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

// Load .env
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INCREASE LIMIT for JSON body to handle file attachments (e.g., 10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middlewares
app.use(cors());
app.use(express.json());

// ================= EMAIL CONFIGURATION (SECURE) =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= CONFIG FOR CHATBOT =================
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID;
const CREDENTIALS_PATH = path.join(__dirname, process.env.DIALOGFLOW_KEY_FILE);

// ================= SEND EMAIL ROUTE =================
app.post("/api/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  const mailOptions = {
    from: `"MindNest Counselor" <${process.env.EMAIL_USER}>`, // Use env var here too
    to: email,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully to:", email);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ================= SEND EMAIL ROUTE (WITH ATTACHMENTS) =================
app.post("/api/send-email-with-attachments", async (req, res) => {
  const { email, subject, message, attachments } = req.body;

  // Process attachments if they exist
  // Frontend sends: [{ filename: "doc.pdf", content: "base64string...", encoding: "base64" }]
  const mailOptions = {
    from: `"MindNest Counselor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: message,
    attachments: attachments || [],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email with ${attachments?.length || 0} attachment(s) sent to: ${email}`,
    );
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ================= ROUTES =================
app.use("/api/mood", moodRoutes);
app.use("/api/Journals", journalRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/appointments", require("./routes/appointmentRoutes"));

app.get("/", (req, res) => {
  res.send("MindNest Backend is Running...");
});

// ================= HELPER: CLEAN GOOGLE DATA =================
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

// ================= CHATBOT ROUTE 1: GATEWAY =================
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
    queryInput: {
      text: { text: text, languageCode: "en-US" },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Collect Payloads
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
    if (result.webhookPayload && result.webhookPayload.fields) {
      const cleaned = cleanGoogleData({ structValue: result.webhookPayload });
      finalPayloads.push({ payload: cleaned });
    }

    const textMsg = result.fulfillmentMessages?.find(
      (m) => m.text && m.text.text,
    );
    const replyText = textMsg
      ? textMsg.text.text[0]
      : result.fulfillmentText || "I'm here with you.";

    res.json({
      reply: replyText,
      payload: finalPayloads,
    });
  } catch (error) {
    console.error("❌ Dialogflow Error:", error);
    res.status(500).json({ reply: "Connection error.", payload: [] });
  }
});

// ================= CHATBOT ROUTE 2: WEBHOOK =================
app.post("/dialogflow", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const addInteractivePayload = (agent, text, chips) => {
    agent.add(text);
    const payloadData = {
      mindnest: {
        text: text,
        type: "suggestion_chips",
        options: chips,
      },
    };
    agent.add(
      new Payload("other", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      }),
    );
  };

  // --- INTENTS ---
  const handleStress = (agent) => {
    const messages = [
      "Stress implies you care, but don't let it consume you.Go to resources and try our stress management section",
      "It sounds like a heavy day. Let's lighten the load.Lie down on bed and listen to relaxation calming peaceful nature sound",
      "Relax!! You are carrying so much stress!!!! Lets try some 2-3 min meditation or exercises to lighten your weight",
      "Want to try some healthy diet? Meditation? exercises? Nature therapy!",
    ];
    addInteractivePayload(agent, random(messages), [
      { text: "Breathing Exercise", link: "/BreathMed" },
      { text: "View Stress Guide", link: "/StressRelief" },
    ]);
  };

  const handleAnxiety = (agent) => {
    addInteractivePayload(
      agent,
      "You're safe here. Let's slow things down.Try some meditation, exercises, calming relaxation therapy!!!",
      [
        { text: "Calming Audio", link: "/BreathMed" },
        { text: "Wellness Resources", link: "/Resources" },
      ],
    );
  };

  const handleMeditation = (agent) => {
    addInteractivePayload(
      agent,
      "Meditation is a great reset button.Try some inhale/exhale exercises?",
      [
        { text: "5-min Focus", link: "/BreathMed" },
        { text: "Sleep Meditation", link: "/SleepTips" },
      ],
    );
  };

  const handleMotivation = (agent) => {
    const quotes = [
      "Believe you can and you're halfway there. Let's try some 5-min meditation which will motivate you to complete your task/goal",
      "Your potential is endless.You are the strongest, please have some healthy diet or smoothie to refresh your mind!!",
    ];
    addInteractivePayload(agent, `${random(quotes)} Need more support?`, [
      { text: "Read Success Stories", link: "/Community" },
      { text: "Study Tips", link: "/Resources" },
    ]);
  };

  const handleCrisis = (agent) => {
    agent.add(
      "Your safety is the most important thing. Please get help.Contact emergency help provided on our platform",
    );
    const payload = {
      mindnest: {
        type: "crisis_alert",
        text: "Please contact support immediately.",
        link: "/counselling",
      },
    };
    agent.add(
      new Payload("other", payload, { sendAsMessage: true, rawPayload: true }),
    );
  };

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", (agent) =>
    agent.add("Hi! I'm MindNest AI. How are you feeling?"),
  );
  intentMap.set("Default Fallback Intent", (agent) =>
    agent.add("I'm here with you. Can you tell me more?"),
  );
  intentMap.set("User_Stress", handleStress);
  intentMap.set("User_Anxiety", handleAnxiety);
  intentMap.set("User_Meditation", handleMeditation);
  intentMap.set("User_Motivation", handleMotivation);
  intentMap.set("Crisis_Alert", handleCrisis);

  agent.handleRequest(intentMap);
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
