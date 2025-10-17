const mongoose = require("mongoose");

const searchRequestSchema = new mongoose.Schema(
  {
    // Search parameters
    searchParams: {
      title: String,
      location: String,
      companyName: [String],
      companyId: [String],
      publishedAt: String,
      workType: String,
      contractType: String,
      experienceLevel: String,
      rows: Number,
    },

    // Results - ALL JOBS STORED AS ARRAY
    jobs: [
      {
        title: String,
        companyName: String,
        location: String,
        publishedAt: String,
        jobLink: String,
        contractType: String,
        posterProfileLink: String,
        description: String,
        scrapedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    jobCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    errorMessage: String,

    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    duration: Number, // in milliseconds
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
searchRequestSchema.index({ createdAt: -1 });
searchRequestSchema.index({ status: 1 });

module.exports = mongoose.model("SearchRequest", searchRequestSchema);
