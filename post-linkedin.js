/**
 * MapleDevs — LinkedIn Automation Engine
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const SHEET_ID = '2PACX-1vSkt2ROoihRVsL4f0m4dXZ1IzD7KYzEghgOwW7QPC2EN6sE4D_iI3stfllfdeq61coOrhdi47eeLmoY';
const SNAPSHOT_PATH = path.join(__dirname, 'tracked_jobs.json');

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN || process.env.LINKEDIN_PERSON_URN; 

async function fetchCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchCSV(res.headers.location));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

function parseCSV(t) {
    const ls = t.trim().split("\n");
    const jobs = [];
    const csvLine = (l) => {
        const r=[]; let c="", q=false;
        for(let i=0; i<l.length; i++){
            const ch=l[i]; if(ch==='"') q=!q; else if(ch===',' && !q) { r.push(c); c=""; } else c+=ch;
        }
        r.push(c); return r;
    };
    const cl = (s) => s.replace(/^"|"$/g,"").trim();
    for(let i=1; i<ls.length; i++){
        const c = csvLine(ls[i]);
        if(!c[0] || !c[1]) continue;
        jobs.push({ 
            title: cl(c[0]), 
            studio: cl(c[1]), 
            location: cl(c[2]||"")
        });
    }
    return jobs;
}

async function postToLinkedIn(message) {
    if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_AUTHOR_URN) {
        console.error('❌ Missing LinkedIn credentials');
        return;
    }

    console.log('📣 Posting to LinkedIn...');

    const url = 'https://api.linkedin.com/v2/ugcPosts';
    
    // Stabilized Payload
    const payload = {
        "author": LINKEDIN_AUTHOR_URN,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": message
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        console.log('✅ LinkedIn post successful:', response.data.id);
    } catch (error) {
        if (error.response) {
            console.error('❌ LinkedIn API Error (Status ' + error.response.status + '):');
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Error posting to LinkedIn:', error.message);
        }
    }
}

async function run() {
    console.log('🔍 Checking for new jobs to announce on LinkedIn...');
    
    const csvData = await fetchCSV(`https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv`);
    const currentJobs = parseCSV(csvData);
    
    let prevJobs = [];
    if (fs.existsSync(SNAPSHOT_PATH)) {
        prevJobs = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    }
    
    const prevKeys = new Set(prevJobs.map(j => `${j.title}|${j.studio}`.toLowerCase()));
    const newJobs = currentJobs.filter(j => !prevKeys.has(`${j.title}|${j.studio}`.toLowerCase()));
    
    if (newJobs.length === 0) {
        console.log('✨ No new jobs since last check.');
        return;
    }
    
    console.log(`🔥 Found ${newJobs.length} fresh roles!`);
    
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];

    let postContent = `Happy ${today}! 🍁\n\nWe just spotted ${newJobs.length} new opportunities for the Canadian game dev community:\n\n`;
    
    newJobs.slice(0, 5).forEach(j => {
        postContent += `✨ ${j.title} at ${j.studio} (${j.location})\n`;
    });
    
    if (newJobs.length > 5) {
        postContent += `...and ${newJobs.length - 5} others added to the board!\n`;
    }
    
    postContent += `\nCheck them out: https://mapledevs.ca\n\n#GameDev #Canada #WorkInGames #MapleDevs`;

    await postToLinkedIn(postContent);
    
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(currentJobs, null, 2));
    console.log('✅ Snapshot updated.');
}

run().catch(console.error);
