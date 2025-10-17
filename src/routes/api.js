const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// Scrape jobs
router.post("/scrape", jobController.scrapeJobs);

// Get search history
router.get("/searches", jobController.getSearchHistory);

// Get specific search with jobs
router.get("/searches/:id", jobController.getSearchById);

// Get all jobs with filters
router.get("/jobs", jobController.getAllJobs);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Job Scraper API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
