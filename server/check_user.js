import mongoose from "mongoose";
import dotenv from "dotenv";
import Counselor from "./models/Counselor.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");
    const counselor = await Counselor.findOne({ email: "samrudhaBagale09@gmail.com" });
    console.log("Counselor in DB:", JSON.stringify(counselor, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
