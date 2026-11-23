import mongoose from "mongoose";
import dns from "dns";

// Fix for querySrv ENOTFOUND on Render / cloud environments where internal DNS cannot resolve SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error(`MongoDB Connection Failed: ${err.message}`);
    // Do not call process.exit(1) on Render, as it causes an infinite crash loop
    // and prevents Render from detecting open ports and marking the service live.
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
