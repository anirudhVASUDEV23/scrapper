const SearchRequest = require("../models/SearchRequest");
const { scrapeJobsWithConfig } = require("../../services/apifyService");
const { log } = require("../../services/loggingService");

// Scrape jobs and save to MongoDB
exports.scrapeJobs = async (req, res) => {
  const startTime = Date.now();

  try {
    log("INFO", "Received scrape request", req.body);

    // Validate required fields
    if (!req.body.location || !req.body.rows) {
      return res.status(400).json({
        success: false,
        error: "Location and rows are required fields",
      });
    }

    // Create search request document
    const searchRequest = new SearchRequest({
      searchParams: {
        title: req.body.title || "",
        location: req.body.location,
        companyName: req.body.companyName || [],
        companyId: req.body.companyId || [],
        publishedAt: req.body.publishedAt || "",
        workType: req.body.workType || "",
        contractType: req.body.contractType || "",
        experienceLevel: req.body.experienceLevel || "",
        rows: parseInt(req.body.rows),
      },
      status: "pending",
    });

    await searchRequest.save();
    log("INFO", `Created search request: ${searchRequest._id}`);

    // Build Apify config
    const config = {};
    if (req.body.title) config.title = req.body.title;
    if (req.body.location) config.location = req.body.location;
    if (req.body.companyName && req.body.companyName.length > 0) {
      config.companyName = req.body.companyName;
    }
    if (req.body.companyId && req.body.companyId.length > 0) {
      config.companyId = req.body.companyId;
    }
    if (req.body.publishedAt) config.publishedAt = req.body.publishedAt;
    if (req.body.workType) config.workType = req.body.workType;
    if (req.body.contractType) config.contractType = req.body.contractType;
    if (req.body.experienceLevel)
      config.experienceLevel = req.body.experienceLevel;

    config.rows = parseInt(req.body.rows);
    config.proxy = {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    };

    log("INFO", "Starting job scraping with config", config);

    // Scrape jobs
    const scrapedJobs = await scrapeJobsWithConfig(config);
    console.log("Scraped Jobs count:", scrapedJobs.length);

    // Log first job to see all available fields
    if (scrapedJobs && scrapedJobs.length > 0) {
      console.log("First job fields:", Object.keys(scrapedJobs[0]));
      console.log("First job sample:", JSON.stringify(scrapedJobs[0], null, 2));
    }

    if (scrapedJobs && scrapedJobs.length > 0) {
      // Prepare ALL jobs as array - try multiple field names for job link
      const jobsArray = scrapedJobs.map((job) => {
        // Try to find the job URL from various possible field names
        let jobUrl =
          job.jobLink ||
          job.link ||
          job.url ||
          job.jobUrl ||
          job.linkedInUrl ||
          job.applyUrl ||
          "";

        // If still no URL, try to construct one from job ID if available
        if (!jobUrl && job.id) {
          jobUrl = `https://www.linkedin.com/jobs/view/${job.id}`;
        } else if (!jobUrl && job.jobId) {
          jobUrl = `https://www.linkedin.com/jobs/view/${job.jobId}`;
        }

        return {
          title: job.title || "No Title",
          companyName: job.companyName || "Unknown Company",
          location: job.location || "Not specified",
          publishedAt: job.publishedAt || new Date().toISOString(),
          jobLink: jobUrl,
          contractType: job.contractType || "",
          posterProfileLink: job.posterProfileLink || "",
          description: job.description || "",
          scrapedAt: new Date(),
        };
      });

      // Store ALL jobs in the SearchRequest document as an array
      const duration = Date.now() - startTime;
      searchRequest.jobs = jobsArray;
      searchRequest.jobCount = jobsArray.length;
      searchRequest.status = "completed";
      searchRequest.completedAt = new Date();
      searchRequest.duration = duration;
      await searchRequest.save();

      log(
        "INFO",
        `Successfully scraped and saved ${jobsArray.length} jobs in search request`
      );

      res.json({
        success: true,
        message: `Successfully scraped ${jobsArray.length} jobs`,
        searchRequestId: searchRequest._id,
        jobCount: jobsArray.length,
        duration: duration,
        jobs: jobsArray, // Return ALL scraped jobs
      });
    } else {
      // No jobs found
      const duration = Date.now() - startTime;
      searchRequest.jobs = [];
      searchRequest.jobCount = 0;
      searchRequest.status = "completed";
      searchRequest.completedAt = new Date();
      searchRequest.duration = duration;
      await searchRequest.save();

      log("WARN", "No jobs found with provided criteria");
      res.json({
        success: true,
        message: "No jobs found matching your criteria",
        searchRequestId: searchRequest._id,
        jobCount: 0,
        jobs: [],
      });
    }
  } catch (error) {
    log("ERROR", "Scraping failed", { error: error.message });

    // Update search request if it exists
    if (req.searchRequest) {
      req.searchRequest.status = "failed";
      req.searchRequest.errorMessage = error.message;
      req.searchRequest.completedAt = new Date();
      await req.searchRequest.save();
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to scrape jobs",
    });
  }
};

// Get all search requests (history)
exports.getSearchHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const searches = await SearchRequest.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await SearchRequest.countDocuments();

    res.json({
      success: true,
      searches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    log("ERROR", "Failed to get search history", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get specific search request with jobs
exports.getSearchById = async (req, res) => {
  try {
    const searchId = req.params.id;

    const searchRequest = await SearchRequest.findById(searchId).lean();
    if (!searchRequest) {
      return res.status(404).json({
        success: false,
        error: "Search request not found",
      });
    }

    // Jobs are stored as an array in the searchRequest document
    res.json({
      success: true,
      searchRequest,
      jobs: searchRequest.jobs || [],
      jobCount: searchRequest.jobCount || 0,
    });
  } catch (error) {
    log("ERROR", "Failed to get search by ID", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all jobs with optional filters
exports.getAllJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.company) {
      filter.companyName = new RegExp(req.query.company, "i");
    }
    if (req.query.location) {
      filter.location = new RegExp(req.query.location, "i");
    }
    if (req.query.title) {
      filter.title = new RegExp(req.query.title, "i");
    }

    const jobs = await Job.find(filter)
      .sort({ scrapedAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("searchRequestId", "searchParams createdAt")
      .lean();

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    log("ERROR", "Failed to get jobs", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
