# JobMatchAI - Architecture Overview

## 📋 Summary

Simple LinkedIn job scraper with web UI. Scrapes jobs using Apify and stores all results in MongoDB.

## 🏗️ Architecture

### Single Model Design

We use **ONE model** - `SearchRequest` - which stores:

- Search parameters (location, company, job title, etc.)
- **ALL scraped jobs as an array** (not separate documents)
- Metadata (status, duration, timestamps)

### Data Flow

1. User fills form on frontend → submits search request
2. Backend creates SearchRequest document with status "pending"
3. Backend calls Apify to scrape LinkedIn jobs
4. **ALL jobs** returned from Apify are stored in `jobs` array field
5. SearchRequest status updated to "completed"
6. Frontend displays all jobs with direct LinkedIn links
7. Search history shows all past searches

## 📂 Project Structure

```
JobMatchAI-main/
├── server.js                    # Express server entry point
├── .env                         # Environment variables (API keys)
├── package.json                 # Dependencies
│
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   └── SearchRequest.js    # ONLY MODEL - stores search + jobs array
│   ├── controllers/
│   │   └── jobController.js    # Business logic
│   └── routes/
│       └── api.js              # API endpoints
│
├── services/
│   ├── apifyService.js         # Apify integration
│   ├── loggingService.js       # Logging utility
│   └── fileService.js          # File operations
│
└── public/                      # Frontend
    ├── index.html              # Web UI
    ├── app.js                  # Frontend JavaScript
    └── styles.css              # Styling
```

## 🔧 Key Features

### 1. All Jobs Stored as Array

- Each search request stores ALL jobs in a single document
- No separate job collection
- Jobs stored in `SearchRequest.jobs` array field

### 2. Search History

- All past searches shown in UI
- Click any search to view its jobs
- Each search has:
  - Search parameters
  - Job count
  - Status (completed/pending/failed)
  - Duration

### 3. Direct LinkedIn Links

- Each job has "View on LinkedIn" button
- Opens job posting in new tab
- Direct access to apply

## 🗄️ Database Schema

### SearchRequest Model (ONLY MODEL)

```javascript
{
  searchParams: {
    title: String,
    location: String,
    companyName: [String],
    companyId: [String],
    publishedAt: String,
    workType: String,
    contractType: String,
    experienceLevel: String,
    rows: Number
  },

  jobs: [{                    // ALL JOBS STORED HERE
    title: String,
    companyName: String,
    location: String,
    publishedAt: String,
    jobLink: String,          // LinkedIn URL
    contractType: String,
    posterProfileLink: String,
    description: String,
    scrapedAt: Date
  }],

  jobCount: Number,
  status: "pending" | "completed" | "failed",
  errorMessage: String,
  startedAt: Date,
  completedAt: Date,
  duration: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 API Endpoints

### POST /api/scrape

Scrape LinkedIn jobs based on search criteria.

**Request Body:**

```json
{
  "title": "Software Engineer",
  "location": "United States",
  "companyName": ["Google", "Microsoft"],
  "publishedAt": "r604800",
  "rows": 50
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully scraped 50 jobs",
  "searchRequestId": "507f1f77bcf86cd799439011",
  "jobCount": 50,
  "duration": 120500,
  "jobs": [...]  // Array of ALL jobs
}
```

### GET /api/searches

Get all search history (latest first).

**Response:**

```json
{
  "success": true,
  "searches": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "searchParams": {...},
      "jobCount": 50,
      "status": "completed",
      "duration": 120500,
      "createdAt": "2025-10-17T07:30:00.000Z"
    }
  ]
}
```

### GET /api/searches/:id

Get specific search with ALL its jobs.

**Response:**

```json
{
  "success": true,
  "searchRequest": {
    "_id": "507f1f77bcf86cd799439011",
    "searchParams": {...},
    "jobs": [...],  // ALL jobs for this search
    "jobCount": 50,
    "status": "completed"
  }
}
```

### GET /api/jobs

Get all jobs from ALL searches combined.

### GET /api/health

Health check endpoint.

## 🎨 Frontend Features

1. **Search Form**

   - All Apify parameters available
   - Real-time validation
   - Submit to scrape jobs

2. **Results Display**

   - Shows all scraped jobs
   - Each job has:
     - Title, Company, Location
     - Published date, Contract type
     - Direct LinkedIn link button

3. **Search History**

   - View all past searches
   - Click to load jobs for that search
   - Shows status and duration

4. **Download**
   - Export jobs as JSON file

## 🔑 Environment Variables

```env
APIFY_API_KEY=your_apify_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
```

## 🚦 Running the Application

```bash
# Install dependencies
npm install

# Start server
npm start

# Access UI
http://localhost:3000
```

## 💡 Key Design Decisions

### Why One Model?

- Simpler structure
- Jobs naturally belong to a search request
- Easier to manage and query
- No orphaned job documents

### Why Store All Jobs?

- User requested: "show all jobs and store all jobs"
- No filtering or duplicate checking
- If Apify returns 50 jobs, we store all 50
- Transparent - what you scrape is what you get

### Why Array Instead of References?

- Jobs don't need to exist independently
- Faster queries (no joins/population needed)
- Simpler code
- Jobs are tied to their search context

## 🔧 MongoDB Collections

We only have **ONE collection**:

- `searchrequests` - Contains search parameters AND all jobs as embedded array

The `jobs` collection is NOT used (we deleted Job.js model).

## 📊 Data Flow Example

1. User searches for "Google Software Engineer in India, 50 jobs"
2. System creates SearchRequest document
3. Apify scrapes LinkedIn, returns 50 jobs
4. **All 50 jobs** stored in `SearchRequest.jobs` array
5. SearchRequest saved with jobCount: 50, status: "completed"
6. Frontend displays all 50 jobs with LinkedIn links
7. User can click search history to reload these 50 jobs anytime

## ✅ No Duplicate Checking

- Every scrape is stored as-is
- No filtering
- No duplicate prevention
- All jobs from Apify → Database → UI
