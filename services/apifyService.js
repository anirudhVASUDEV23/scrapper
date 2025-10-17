const { ApifyClient } = require("apify-client");
const { log } = require("./loggingService");
const { readJSONFromFile } = require("./fileService");

const APIFY_API_KEY = process.env.APIFY_API_KEY;

async function scrapeJobs() {
  log("INFO", "Initializing Apify client...");
  const client = new ApifyClient({ token: APIFY_API_KEY });
  const actorId = "BHzefUZlZRKWxkTck";

  const input = readJSONFromFile("apify_input.json");

  log("INFO", "Running Apify actor...");
  try {
    const run = await client.actor(actorId).call(input);
    log("INFO", "Fetching job results from the dataset...");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log("Scraped Items:", items);
    log("INFO", `Successfully fetched ${items.length} jobs.`);
    return items;
  } catch (error) {
    log("ERROR", "Error during job scraping.", { error: error.message });
    throw error;
  }
}

async function scrapeJobsWithConfig(config) {
  log("INFO", "Initializing Apify client with custom config...");
  const client = new ApifyClient({ token: APIFY_API_KEY });
  const actorId = "BHzefUZlZRKWxkTck";

  log("INFO", "Running Apify actor with config...", config);
  try {
    const run = await client.actor(actorId).call(config);
    log("INFO", "Fetching job results from the dataset...");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    log("INFO", `Successfully fetched ${items.length} jobs.`);

    // Debug: Log first item fields
    if (items.length > 0) {
      console.log("=== APIFY RAW DATA SAMPLE ===");
      console.log("Available fields:", Object.keys(items[0]));
      console.log("Sample job:", JSON.stringify(items[0], null, 2));
      console.log("=== END SAMPLE ===");
    }

    return items;
  } catch (error) {
    log("ERROR", "Error during job scraping.", { error: error.message });
    throw error;
  }
}

module.exports = { scrapeJobs, scrapeJobsWithConfig };
