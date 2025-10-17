const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : `${window.location.origin}/api`;

// Check scraping state on page load
document.addEventListener("DOMContentLoaded", () => {
  // Clear any stale scraping state on page load
  // Check if scraping timestamp is older than 5 minutes (likely stale)
  const scrapingTimestamp = localStorage.getItem("scrapingTimestamp");
  const isScrapingInProgress =
    localStorage.getItem("isScrapingInProgress") === "true";

  if (isScrapingInProgress && scrapingTimestamp) {
    const elapsed = Date.now() - parseInt(scrapingTimestamp);
    const fiveMinutes = 5 * 60 * 1000;

    if (elapsed > fiveMinutes) {
      // Stale state - clear it
      localStorage.removeItem("isScrapingInProgress");
      localStorage.removeItem("scrapingTimestamp");
    }
  } else if (isScrapingInProgress) {
    // No timestamp but flag is set - clear stale flag
    localStorage.removeItem("isScrapingInProgress");
  }

  checkScrapingState();

  // Poll to check if scraping completed (every 3 seconds)
  setInterval(checkScrapingState, 3000);
});

// Function to check and update scraping state
function checkScrapingState() {
  const isScrapingInProgress =
    localStorage.getItem("isScrapingInProgress") === "true";
  const submitBtn = document.getElementById("scrapeBtn");
  const scrapeForm = document.getElementById("scrapeForm");

  if (!submitBtn) return;

  if (isScrapingInProgress) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Scraping in Progress...";
    scrapeForm.style.opacity = "0.6";
    scrapeForm.style.pointerEvents = "none";

    // Show warning message
    let warning = document.getElementById("scraping-warning");
    if (!warning) {
      warning = document.createElement("div");
      warning.id = "scraping-warning";
      warning.className = "alert alert-warning";
      warning.innerHTML =
        "⚠️ A scraping request is currently in progress. Please wait for it to complete before starting a new one.";
      scrapeForm.parentElement.insertBefore(warning, scrapeForm);
    }
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "🚀 Start Scraping";
    scrapeForm.style.opacity = "1";
    scrapeForm.style.pointerEvents = "auto";

    // Remove warning message
    const warning = document.getElementById("scraping-warning");
    if (warning) {
      warning.remove();
    }
  }
}

// Form submission
document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check if already scraping
  if (localStorage.getItem("isScrapingInProgress") === "true") {
    alert(
      "⚠️ A scraping request is already in progress. Please wait for it to complete."
    );
    return;
  }

  const submitBtn = document.getElementById("scrapeBtn");
  const resultsCard = document.getElementById("resultsCard");
  const results = document.getElementById("results");
  const jobsCard = document.getElementById("jobsCard");

  // Set scraping state with timestamp
  localStorage.setItem("isScrapingInProgress", "true");
  localStorage.setItem("scrapingTimestamp", Date.now().toString());

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span> Scraping...';

  // Show loading message
  resultsCard.style.display = "block";
  results.innerHTML =
    '<div class="alert alert-info">🔄 Scraping jobs from LinkedIn... This may take a minute.</div>';
  jobsCard.style.display = "none";

  try {
    // Get form data
    const formData = new FormData(e.target);
    const data = {};

    // Process form fields
    for (const [key, value] of formData.entries()) {
      if (value) {
        if (key === "companyName" || key === "companyId") {
          // Split comma-separated values into array
          data[key] = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        } else if (key === "rows") {
          data[key] = parseInt(value);
        } else {
          data[key] = value;
        }
      }
    }

    console.log("Sending request:", data);

    // Make API request
    const response = await fetch(`${API_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("Response:", result);

    if (result.success) {
      // Show success message with stats
      results.innerHTML = `
                <div class="alert alert-success">
                    ✅ Successfully scraped ${result.jobCount} jobs!
                    <br>
                    <small>⏱️ Duration: ${(result.duration / 1000).toFixed(
                      1
                    )}s</small>
                </div>
            `;

      // Display jobs
      if (result.jobs && result.jobs.length > 0) {
        console.log("Displaying jobs:", result.jobs);
        const title = `${data.title || "All Jobs"} - ${data.location}`;
        displayJobs(result.jobs, title);
      } else {
        results.innerHTML += `
          <div class="alert alert-info">
            ℹ️ No jobs found matching your criteria.
          </div>
        `;
      }
    } else {
      // Show error message
      results.innerHTML = `
                <div class="alert alert-error">
                    ❌ Error: ${result.error}
                </div>
            `;
    }
  } catch (error) {
    console.error("Error:", error);
    results.innerHTML = `
            <div class="alert alert-error">
                ❌ Failed to scrape jobs: ${error.message}
            </div>
        `;
  } finally {
    console.log("Finally block executing - cleaning up scraping state");

    // Clear scraping state and timestamp
    localStorage.removeItem("isScrapingInProgress");
    localStorage.removeItem("scrapingTimestamp");
    console.log(
      "localStorage cleared:",
      localStorage.getItem("isScrapingInProgress")
    );

    // Remove warning message immediately
    const warning = document.getElementById("scraping-warning");
    if (warning) {
      console.log("Removing warning message");
      warning.remove();
    }

    // Re-enable form
    const scrapeForm = document.getElementById("scrapeForm");
    if (scrapeForm) {
      scrapeForm.style.opacity = "1";
      scrapeForm.style.pointerEvents = "auto";
    }

    // Re-enable submit button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "🚀 Start Scraping";
    }

    console.log("Cleanup complete");
  }
});

// Display jobs
function displayJobs(jobs, title = "Scraped Jobs") {
  const jobsCard = document.getElementById("jobsCard");
  const jobsList = document.getElementById("jobsList");
  const jobCount = document.getElementById("jobCount");
  const jobsHeader = document.querySelector(".jobs-header h2");

  // Add null checks for all elements
  if (!jobsCard || !jobsList || !jobCount) {
    console.error("Required DOM elements not found");
    return;
  }

  // Update title
  if (jobsHeader) {
    jobsHeader.textContent = title;
  }

  jobCount.textContent = jobs.length;
  jobsCard.style.display = "block";

  // Store jobs for download
  window.scrapedJobs = jobs;

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #888;">
        <p>No jobs found</p>
      </div>
    `;
    return;
  }

  console.log("Displaying jobs:", jobs.length, "jobs");
  console.log("Sample job:", jobs[0]);

  jobsList.innerHTML = jobs
    .map(
      (job, index) => `
        <div class="job-item">
            <div class="job-title">${job.title || "N/A"}</div>
            <div class="job-company">${job.companyName || "N/A"}</div>
            <div class="job-details">
                <div class="job-detail">
                    📍 ${job.location || "N/A"}
                </div>
                <div class="job-detail">
                    📅 ${formatDate(job.publishedAt)}
                </div>
                ${
                  job.contractType
                    ? `
                    <div class="job-detail">
                        💼 ${getContractTypeName(job.contractType)}
                    </div>
                `
                    : ""
                }
            </div>
            ${
              job.jobLink
                ? `
                <a href="${job.jobLink}" target="_blank" class="job-link" rel="noopener noreferrer">
                    🔗 View on LinkedIn →
                </a>
            `
                : `<div style="color: #888; font-size: 0.9rem; margin-top: 10px;">⚠️ No job link available</div>`
            }
        </div>
    `
    )
    .join("");
}

// Download JSON
document.getElementById("downloadJsonBtn").addEventListener("click", () => {
  if (!window.scrapedJobs || window.scrapedJobs.length === 0) {
    alert("No jobs to download");
    return;
  }

  const dataStr = JSON.stringify(window.scrapedJobs, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `jobs-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
});

// Download CSV
document.getElementById("downloadCsvBtn").addEventListener("click", () => {
  if (!window.scrapedJobs || window.scrapedJobs.length === 0) {
    alert("No jobs to download");
    return;
  }

  const csv = convertToCSV(window.scrapedJobs);
  const dataBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `jobs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
});

// Convert jobs to CSV format
function convertToCSV(jobs) {
  if (!jobs || jobs.length === 0) return "";

  // Define CSV headers
  const headers = [
    "Title",
    "Company",
    "Location",
    "Published Date",
    "Contract Type",
    "Job Link",
    "Description",
    "Scraped At",
  ];

  // Create CSV rows
  const rows = jobs.map((job) => {
    return [
      escapeCSV(job.title || ""),
      escapeCSV(job.companyName || ""),
      escapeCSV(job.location || ""),
      escapeCSV(job.publishedAt || ""),
      escapeCSV(job.contractType || ""),
      escapeCSV(job.jobLink || ""),
      escapeCSV(job.description || ""),
      escapeCSV(job.scrapedAt || ""),
    ].join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
}

// Escape CSV values (handle commas, quotes, newlines)
function escapeCSV(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}

// View Search History
document
  .getElementById("viewHistoryBtn")
  .addEventListener("click", async () => {
    const historyCard = document.getElementById("historyCard");
    const historyList = document.getElementById("historyList");

    historyList.innerHTML =
      '<div class="alert alert-info">📊 Loading search history...</div>';
    historyCard.style.display = "block";

    try {
      const response = await fetch(`${API_URL}/searches?limit=10`);
      const result = await response.json();

      if (result.success && result.searches && result.searches.length > 0) {
        historyList.innerHTML = result.searches
          .map(
            (search) => `
        <div class="history-item" onclick="loadSearchResults('${search._id}')">
          <div class="history-header">
            <strong>${search.searchParams.title || "All Jobs"}</strong>
            <span class="history-badge ${search.status}">${search.status}</span>
          </div>
          <div class="history-details">
            <span>📍 ${search.searchParams.location}</span>
            <span>📊 ${search.jobCount} jobs</span>
            <span>📅 ${formatDate(search.createdAt)}</span>
            ${
              search.duration
                ? `<span>⏱️ ${(search.duration / 1000).toFixed(1)}s</span>`
                : ""
            }
          </div>
          ${
            search.searchParams.companyName &&
            search.searchParams.companyName.length > 0
              ? `<div class="history-companies">🏢 ${search.searchParams.companyName.join(
                  ", "
                )}</div>`
              : ""
          }
        </div>
      `
          )
          .join("");
      } else {
        historyList.innerHTML =
          '<div class="alert alert-info">No search history found. Start your first search!</div>';
      }
    } catch (error) {
      console.error("Error loading history:", error);
      historyList.innerHTML = `<div class="alert alert-error">❌ Failed to load history: ${error.message}</div>`;
    }
  });

// Load specific search results
async function loadSearchResults(searchId) {
  const resultsCard = document.getElementById("resultsCard");
  const results = document.getElementById("results");
  const jobsCard = document.getElementById("jobsCard");

  // Hide jobs card while loading
  jobsCard.style.display = "none";

  results.innerHTML =
    '<div class="alert alert-info">📊 Loading search results...</div>';
  resultsCard.style.display = "block";

  try {
    const response = await fetch(`${API_URL}/searches/${searchId}`);
    const result = await response.json();

    if (result.success) {
      const search = result.searchRequest;
      results.innerHTML = `
        <div class="alert alert-success">
          ✅ Search from ${formatDate(search.createdAt)}
          <br>
          <small>📍 ${search.searchParams.location} | 📊 ${
        result.jobCount
      } jobs</small>
        </div>
      `;

      if (result.jobs && result.jobs.length > 0) {
        const title = `${search.searchParams.title || "All Jobs"} - ${
          search.searchParams.location
        }`;
        displayJobs(result.jobs, title);
      } else {
        results.innerHTML += `<div class="alert alert-info">No jobs in this search</div>`;
      }
    } else {
      results.innerHTML = `<div class="alert alert-error">❌ Error: ${result.error}</div>`;
    }
  } catch (error) {
    console.error("Error loading search results:", error);
    results.innerHTML = `<div class="alert alert-error">❌ Failed to load results: ${error.message}</div>`;
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getContractTypeName(type) {
  const types = {
    F: "Full-time",
    P: "Part-time",
    C: "Contract",
    T: "Temporary",
    I: "Internship",
    V: "Volunteer",
  };
  return types[type] || type;
}
