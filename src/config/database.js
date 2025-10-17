const mongoose = require("mongoose");
const { log } = require("../../services/loggingService");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/jobscraper";

    await mongoose.connect(mongoURI);

    log("INFO", `MongoDB connected successfully to ${mongoURI}`);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    log("ERROR", "MongoDB connection failed", { error: error.message });
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  log("WARN", "MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  log("ERROR", "MongoDB error", { error: err.message });
});

module.exports = connectDB;
