const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } = require("dialogflow-fulfillment");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("MindNest Chatbot Server is Running!");
});

app.post("/dialogflow", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  console.log("Intent detected: " + agent.intent);
  console.log("Request Source: " + agent.requestSource); // Useful for debugging

  // === 1. WELCOME INTENT ===
  function welcome(agent) {
    agent.add(
      "Hi! I am MindNest's AI companion. I'm here to listen. How are you feeling right now?"
    );
  }

  // === 2. FALLBACK INTENT ===
  function fallback(agent) {
    agent.add(
      "I didn't quite get that. Could you tell me a bit more about how you're feeling?"
    );
  }

  // === HELPER FUNCTION TO SAFELY SEND BUTTONS ===
  function addInteractivePayload(agent, textResponse, payloadData) {
    // 1. Always send the text
    agent.add(textResponse);

    // 2. ONLY send buttons if we are NOT in the Dialogflow Console
    // (The console crashes if you try to send rich data)
    if (agent.requestSource !== "DIALOGFLOW_CONSOLE") {
      const payload = {
        mindnest: {
          type: "suggestion_chips",
          options: payloadData,
        },
      };
      // 'other' is a safe fallback platform tag
      agent.add(
        new Payload("other", payload, { sendAsMessage: true, rawPayload: true })
      );
    } else {
      console.log("Skipping rich payload for Console testing");
    }
  }

  // === 3. STRESS HANDLING ===
  function handleStress(agent) {
    addInteractivePayload(
      agent,
      "I hear you. Academic pressure can be heavy. I recommend trying a quick breathing exercise to reset.",
      [
        { text: "Open Breathing Exercise", link: "/Resources" },
        { text: "Read Stress Guide", link: "/Stress" },
      ]
    );
  }

  // === 4. ANXIETY HANDLING ===
  function handleAnxiety(agent) {
    addInteractivePayload(
      agent,
      "You are safe here. Take a deep breath with me. Let's focus on the present moment.",
      [
        { text: "Try 5-4-3-2-1 Grounding", link: "/Resources" },
        { text: "Listen to Calming Audio", link: "/Resources" },
      ]
    );
  }

  // === 5. CRISIS DETECTION ===
  function handleCrisis(agent) {
    // For Crisis, we send a specific 'crisis_alert' type
    agent.add(
      "You are not alone. Please reach out to a professional immediately."
    );

    if (agent.requestSource !== "DIALOGFLOW_CONSOLE") {
      const payload = {
        mindnest: {
          type: "crisis_alert",
          text: "Contact Crisis Support Now",
          link: "/Counselling",
        },
      };
      agent.add(
        new Payload("other", payload, { sendAsMessage: true, rawPayload: true })
      );
    }
  }

  // === MAPPING INTENTS ===
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("User_Stress", handleStress);
  intentMap.set("User_Anxiety", handleAnxiety);
  intentMap.set("Crisis_Alert", handleCrisis);

  agent.handleRequest(intentMap);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`MindNest Chatbot Webhook running on port ${PORT}`);
});
