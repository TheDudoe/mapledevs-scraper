# 🍁 MapleDevs — Canada's Game Industry Job Board

> **[mapledevs.ca](https://mapledevs.ca)** — No US-only roles, no noise. Every listing is verified from a Canadian studio.

## Project Structure

```
MapleDevs/
├── index.html                          # The entire website (single file, GitHub Pages)
├── scripts/
│   ├── scrape-jobs.js                  # Automated job scraper
│   └── package.json                    # Scraper dependencies
├── .github/
│   └── workflows/
│       └── scrape-jobs.yml             # Daily auto-scrape workflow
└── README.md                           # This file
```

## Features

### Website (`index.html`)
- 🎨 Premium design with dark mode
- 🔍 Search with highlighting + filters (city, type, mode, student-friendly)
- 🏢 Studio directory auto-generated from job data
- ♥ Saved jobs (localStorage)
- 📋 **Post a Job** form — submissions land in your email
- 🍁 Animated floating maple leaves, glassmorphism cards
- ⌨️ Keyboard shortcuts (`/` search, `Esc` clear)
- 📱 Fully responsive
- ♿ Accessible (ARIA, skip links, keyboard nav)

### Automated Scraper (`scripts/scrape-jobs.js`)
- 🤖 Scrapes studio career pages using **free public APIs** (no auth needed for scraping)
- 📊 Syncs with your Google Sheet (add new jobs, remove expired ones)
- ⏰ Runs daily via GitHub Actions
- 🎯 Smart detection: job type, work mode, student-friendly

---

## Setup Guide

### 1. Post a Job Form (Email Delivery)

The "Post a Job" button uses [FormSubmit.co](https://formsubmit.co/) to send form data to your email. **No setup needed!**

**How it works:**
1. A studio fills out the form on your site
2. FormSubmit sends the data to `mapledevsbusiness@gmail.com`
3. First time only: you'll get a confirmation email from FormSubmit — **click the link to activate**
4. After that, all submissions arrive as formatted emails
5. You review and manually add approved jobs to your Google Sheet

> ⚠️ **Important:** The first form submission will trigger a confirmation email from FormSubmit. Check your inbox (and spam folder) and click the activation link.

### 2. Automated Job Scraping (Optional but Recommended)

This is the system that automatically finds new jobs from Canadian studio career pages and removes expired ones.

#### Step 1: Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**:
   - Go to APIs & Services → Library
   - Search "Google Sheets API" → Enable
4. Create a Service Account:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "Service Account"
   - Name it something like "mapledevs-scraper"
   - Click through (no roles needed)
5. Create a key:
   - Click on the service account → Keys tab
   - Add Key → Create new key → JSON
   - Download the JSON file

#### Step 2: Share Your Google Sheet

1. Open your Google Sheet
2. Click "Share"
3. Add the service account email (looks like `name@project.iam.gserviceaccount.com`)
4. Give it **Editor** access

#### Step 3: Find Your Sheet ID

Your Google Sheet URL looks like:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```
Copy the `1L2KcTO32jK5MVY1m3qdqdja7LTZ38f8lYXsK5mNMMDo` part. 

#### Step 4: Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and Variables → Actions → New repository secret:

| Secret Name | Value |
|------------|-------|
| `GOOGLE_SHEET_ID` | Your Sheet ID from Step 3 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The service account email |
| `GOOGLE_PRIVATE_KEY` | The `private_key` field from the JSON file, **base64 encoded*** |

*To base64 encode the private key:
```bash
# On Mac/Linux:
echo -n "YOUR_PRIVATE_KEY" | base64

# On Windows (PowerShell):
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("
```

#### Step 5: Add Studios to Scrape

Edit `scripts/scrape-jobs.js` and add studios to the `STUDIOS` array:

```javascript
const STUDIOS = [
  {
    name: "Digital Extremes",
    platform: "greenhouse",
    token: "digitalextremes",
    city: "London, Ontario",
    locationFilter: null,
  },
  // Add more studios here!
];
```

**How to find a studio's token:**

1. Visit the studio's careers page
2. Look at the URL:
   - If it contains `boards.greenhouse.io/TOKEN` → platform is `"greenhouse"`, token is `TOKEN`
   - If it contains `jobs.lever.co/TOKEN` → platform is `"lever"`, token is `TOKEN`
3. Some studios embed their career pages — view page source and search for `greenhouse` or `lever`

#### Step 6: Test Locally

```bash
cd scripts
npm install
node scrape-jobs.js
```

Without Google Sheet env vars, it will output scraped jobs as CSV to the console.

#### Step 7: Deploy

Push to GitHub. The workflow runs automatically every day at 8 AM UTC (3 AM EST).

You can also trigger it manually: GitHub repo → Actions tab → "Scrape Canadian Game Studio Jobs" → Run workflow.

### 3. Adding Studios Manually

Not all studios use Greenhouse or Lever. For those, you have two options:

1. **Studios email you** via the "Post a Job" form
2. **You add them manually** to your Google Sheet

Your spreadsheet columns should be:
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Title | Studio | Location | Type | Mode | Description | Apply URL | Posted Date | Featured | Student | Salary |

---

## Common Tasks

### Change the form email
In `index.html`, search for `formsubmit.co/ajax/` and change the email address.

### Adjust scraping schedule
In `.github/workflows/scrape-jobs.yml`, edit the cron expression:
```yaml
schedule:
  - cron: '0 8 * * *'  # Currently: daily at 8 AM UTC
```

### Add a new ATS platform
Edit `scripts/scrape-jobs.js` and add a new scraper function following the Greenhouse/Lever pattern.

---

## Tech Stack

- **Frontend:** Pure HTML/CSS/JS (no build tools, no framework)
- **Hosting:** GitHub Pages
- **CMS:** Google Sheets (published as CSV)
- **Forms:** FormSubmit.co (free)
- **Analytics:** Google Analytics (G-DPWQMPD0ZC)
- **Automation:** GitHub Actions + Node.js
- **APIs:** Greenhouse Job Board API, Lever Postings API

## License

© 2026 MapleDevs. All rights reserved.
