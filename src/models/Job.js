const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Job details from LinkedIn
    title: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: String,
    publishedAt: String,
    jobLink: {
      type: String,
      required: false, // Some jobs may not have a link
    },
    contractType: String,
    posterProfileLink: String,
    description: String,

    // Metadata
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    searchRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SearchRequest",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
jobSchema.index({ jobLink: 1 }); // Regular index, allows duplicates
jobSchema.index({ searchRequestId: 1 });
jobSchema.index({ scrapedAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
