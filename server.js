require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/config/database");
const apiRoutes = require("./src/routes/api");
const { log } = require("./services/loggingService");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve frontend files

// API Routes
app.use("/api", apiRoutes);

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  log("ERROR", "Unhandled error", { error: err.message });
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  log("INFO", `Server running on http://localhost:${PORT}`);
  console.log(`\n🚀 Job Scraper UI: http://localhost:${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(
    `📊 MongoDB: ${
      process.env.MONGODB_URI || "mongodb://localhost:27017/jobscraper"
    }\n`
  );
});
