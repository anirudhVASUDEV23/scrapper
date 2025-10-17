# 🚀 Deployment Guide - JobMatchAI

## Prerequisites

- GitHub account
- MongoDB Atlas account (with your database connection string)
- Apify account (with your API key)

---

## 🌐 Option 1: Deploy to Vercel (Easiest & Free)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

### Step 4: Set Environment Variables

After deployment, go to Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables (use your actual values from .env file):
   - `APIFY_API_KEY` = (your Apify API key)
   - `MONGODB_URI` = (your MongoDB Atlas connection string)
   - `PORT` = `3000`

### Step 5: Redeploy

```bash
vercel --prod
```

**Your app will be live at:** `https://your-app-name.vercel.app`

---

## 🎨 Option 2: Deploy to Render (Free with Database)

### Step 1: Push to GitHub

Your code is already on GitHub!

### Step 2: Deploy on Render

1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** jobmatchai
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 3: Add Environment Variables

In Render dashboard, add (use your actual values from .env file):

- `APIFY_API_KEY` = (your Apify API key)
- `MONGODB_URI` = (your MongoDB connection string)
- `NODE_ENV` = `production`

**Your app will be live at:** `https://jobmatchai.onrender.com`

---

## 🚂 Option 3: Deploy to Railway (Fast & Easy)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize & Deploy

```bash
railway init
railway up
```

### Step 4: Add Environment Variables

```bash
railway variables set APIFY_API_KEY=your_apify_api_key
railway variables set MONGODB_URI=your_mongodb_connection_string
```

### Step 5: Generate Domain

```bash
railway domain
```

**Your app will be live at:** `https://your-app.railway.app`

---

## 📋 Important Notes

### Environment Variables

- Never commit `.env` file to GitHub
- Always use the deployment platform's environment variable settings
- Get your actual API keys from:
  - Apify: https://console.apify.com/account/integrations
  - MongoDB: Your Atlas cluster connection string

### MongoDB Atlas Setup

Make sure MongoDB Atlas allows connections from all IPs:

1. Go to Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs - needed for deployment platforms)

---

## 🔧 Files Already Configured

✅ `vercel.json` - Vercel deployment configuration
✅ `public/app.js` - API URL automatically adapts to environment
✅ `public/history.js` - API URL automatically adapts to environment
✅ `.gitignore` - Prevents committing sensitive files

---

## 🎯 Recommended: Deploy to Vercel

**Why Vercel?**

- ✅ Easiest deployment (2 commands)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier is generous
- ✅ Instant deployments

### Quick Start:

```bash
npm install -g vercel
vercel login
vercel
```

Set your environment variables in the dashboard, then:

```bash
vercel --prod
```

That's it! 🚀

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"

- Verify MongoDB Atlas allows all IPs (0.0.0.0/0)
- Check MONGODB_URI environment variable

### "CORS error"

- Already configured to work in production

### "Apify API error"

- Verify APIFY_API_KEY is set correctly
- Check API key validity at https://console.apify.com/

---

## 📊 After Deployment

Test all features:

- ✅ Search form submission
- ✅ Job scraping
- ✅ History page
- ✅ CSV/JSON downloads
- ✅ Navigation between pages

---

## 🎉 Success!

Your JobMatchAI app is now deployed! Share the URL and enjoy! 🌍
