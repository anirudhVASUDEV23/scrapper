# CSV Download Feature

## 📊 What Was Added

### Both Home and History Pages Now Support:

1. **📥 JSON Download** - Download jobs in JSON format (original functionality)
2. **📊 CSV Download** - Download jobs in CSV format (NEW!)

## 🔧 CSV Format

The CSV file includes the following columns:

- **Title** - Job title
- **Company** - Company name
- **Location** - Job location
- **Published Date** - When the job was posted
- **Contract Type** - Full-time, Part-time, Contract, etc.
- **Job Link** - Direct LinkedIn URL to apply
- **Description** - Full job description
- **Scraped At** - When the job was scraped

## ✨ Features

### Proper CSV Handling:

- ✅ Escapes commas in values
- ✅ Handles quotes properly (double-quote escaping)
- ✅ Preserves newlines in descriptions
- ✅ UTF-8 encoding for special characters
- ✅ Compatible with Excel, Google Sheets, and other tools

### Button Layout:

- Side-by-side buttons: `📥 JSON` and `📊 CSV`
- Clean, compact design
- Same functionality on both Home and History pages

## 📝 Usage

### Home Page:

1. Scrape jobs using the search form
2. Jobs will display in cards below
3. Click **📊 CSV** to download as CSV or **📥 JSON** for JSON format

### History Page:

1. Click on any search from history
2. Jobs will load for that search
3. Click **📊 CSV** to download as CSV or **📥 JSON** for JSON format

## 🎯 Benefits of CSV

- **Easy to view** in Excel or Google Sheets
- **Filter and sort** data easily
- **Share with non-technical users** who prefer spreadsheets
- **Import into databases** or other tools
- **Analyze data** using pivot tables and charts

## 🔍 CSV vs JSON

| Feature          | CSV               | JSON              |
| ---------------- | ----------------- | ----------------- |
| Human Readable   | ⭐⭐⭐⭐⭐        | ⭐⭐⭐            |
| Excel Compatible | ✅                | ❌                |
| Nested Data      | ❌                | ✅                |
| File Size        | Smaller           | Larger            |
| Best For         | Viewing, Analysis | Programming, APIs |

## Example CSV Output:

```csv
Title,Company,Location,Published Date,Contract Type,Job Link,Description,Scraped At
"Data Analyst","Google","United States","2025-10-17","Full-time","https://www.linkedin.com/jobs/view/123456","Analyze data and create reports...","2025-10-17T08:45:57.249Z"
"Software Engineer","Microsoft","India","2025-10-16","Full-time","https://www.linkedin.com/jobs/view/789012","Develop software applications...","2025-10-17T08:45:57.249Z"
```

This CSV can be opened directly in Excel or Google Sheets for easy viewing and analysis!
