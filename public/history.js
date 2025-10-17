const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : `${window.location.origin}/api`;

// Load history on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSearchHistory();

  // Refresh button
  document.getElementById("refreshBtn").addEventListener("click", () => {
    loadSearchHistory();
  });

  // Back button
  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("jobsCard").style.display = "none";
    document.getElementById("historyContainer").style.display = "block";
  });

  // Download JSON button
  document
    .getElementById("downloadJsonBtn")
    .addEventListener("click", downloadJobsJSON);

  // Download CSV button
  document
    .getElementById("downloadCsvBtn")
    .addEventListener("click", downloadJobsCSV);
});

// Load all search history
async function loadSearchHistory() {
  const loadingState = document.getElementById("loadingState");
  const historyContainer = document.getElementById("historyContainer");
  const emptyState = document.getElementById("emptyState");
  const historyList = document.getElementById("historyList");
  const searchCount = document.getElementById("searchCount");

  // Show loading
  loadingState.style.display = "block";
  historyContainer.style.display = "none";
  emptyState.style.display = "none";

  try {
    const response = await fetch(`${API_URL}/searches`);
    const result = await response.json();

    if (result.success && result.searches.length > 0) {
      searchCount.textContent = result.searches.length;
      displayHistory(result.searches);
      loadingState.style.display = "none";
      historyContainer.style.display = "block";
    } else {
      // No searches found
      loadingState.style.display = "none";
      emptyState.style.display = "block";
    }
  } catch (error) {
    console.error("Error loading history:", error);
    loadingState.style.display = "none";
    historyList.innerHTML = `
      <div class="alert alert-error">
        ❌ Failed to load search history: ${error.message}
      </div>
    `;
    historyContainer.style.display = "block";
  }
}

// Display search history
function displayHistory(searches) {
  const historyList = document.getElementById("historyList");

  historyList.innerHTML = searches
    .map(
      (search) => `
    <div class="history-item" onclick="loadSearchJobs('${search._id}')">
      <div class="history-header">
        <div class="history-title">
          ${search.searchParams.title || "All Jobs"} - ${
        search.searchParams.location
      }
        </div>
        <div class="history-badge status-${search.status}">
          ${search.status.toUpperCase()}
        </div>
      </div>
      
      <div class="history-details">
        <div class="history-detail">
          📍 ${search.searchParams.location}
        </div>
        ${
          search.searchParams.companyName &&
          search.searchParams.companyName.length > 0
            ? `
          <div class="history-detail">
            🏢 ${search.searchParams.companyName.join(", ")}
          </div>
        `
            : ""
        }
        <div class="history-detail">
          📊 ${search.jobCount} jobs
        </div>
        <div class="history-detail">
          📅 ${formatDate(search.createdAt)}
        </div>
        ${
          search.duration
            ? `
          <div class="history-detail">
            ⏱️ ${(search.duration / 1000).toFixed(1)}s
          </div>
        `
            : ""
        }
      </div>
      
      <div class="history-action">
        Click to view jobs →
      </div>
    </div>
  `
    )
    .join("");
}

// Load jobs for a specific search
async function loadSearchJobs(searchId) {
  const historyContainer = document.getElementById("historyContainer");
  const jobsCard = document.getElementById("jobsCard");
  const jobsList = document.getElementById("jobsList");
  const jobsTitle = document.getElementById("jobsTitle");
  const jobsSubtitle = document.getElementById("jobsSubtitle");

  // Hide history, show loading in jobs card
  historyContainer.style.display = "none";
  jobsCard.style.display = "block";
  jobsList.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="loading-spinner"></div>
      <p style="margin-top: 20px; color: #888;">Loading jobs...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}/searches/${searchId}`);
    const result = await response.json();

    if (result.success && result.searchRequest) {
      const search = result.searchRequest;

      // Update header
      jobsTitle.textContent = `${search.searchParams.title || "All Jobs"} (${
        search.jobCount
      } jobs)`;
      jobsSubtitle.textContent = `${
        search.searchParams.location
      } • ${formatDate(search.createdAt)}`;

      // Store jobs for download
      window.currentJobs = result.jobs || [];

      // Display jobs
      if (result.jobs && result.jobs.length > 0) {
        displayJobs(result.jobs);
      } else {
        jobsList.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #888;">
            <p>No jobs found in this search</p>
          </div>
        `;
      }
    } else {
      jobsList.innerHTML = `
        <div class="alert alert-error">
          ❌ Failed to load jobs
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading jobs:", error);
    jobsList.innerHTML = `
      <div class="alert alert-error">
        ❌ Error: ${error.message}
      </div>
    `;
  }
}

// Display jobs
function displayJobs(jobs) {
  const jobsList = document.getElementById("jobsList");

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #888;">
        <p>No jobs found</p>
      </div>
    `;
    return;
  }

  jobsList.innerHTML = jobs
    .map(
      (job) => `
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

// Download jobs as JSON
// Download jobs as JSON
function downloadJobsJSON() {
  if (!window.currentJobs || window.currentJobs.length === 0) {
    alert("No jobs to download");
    return;
  }

  const dataStr = JSON.stringify(window.currentJobs, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `jobs-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download jobs as CSV
function downloadJobsCSV() {
  if (!window.currentJobs || window.currentJobs.length === 0) {
    alert("No jobs to download");
    return;
  }

  const csv = convertToCSV(window.currentJobs);
  const dataBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `jobs-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get contract type name
function getContractTypeName(code) {
  const types = {
    F: "Full-time",
    P: "Part-time",
    C: "Contract",
    T: "Temporary",
    I: "Internship",
    "Full-time": "Full-time",
    "Part-time": "Part-time",
    Contract: "Contract",
    Temporary: "Temporary",
    Internship: "Internship",
  };
  return types[code] || code;
}
