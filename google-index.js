const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

let key;
const rawKey = process.env.GOOGLE_INDEXING_KEY;

if (rawKey) {
    console.log('🔑 GOOGLE_INDEXING_KEY detected. Processing...');
    try {
        // Robust Parsing: Handle double-quotes, newlines, and escaping
        const sanitized = rawKey.trim();
        key = JSON.parse(sanitized);
    } catch (e1) {
        try {
            const decoded = Buffer.from(rawKey.trim(), 'base64').toString('utf8');
            key = JSON.parse(decoded);
            console.log('✅ Successfully decoded Base64 credentials.');
        } catch (e2) {
            console.error('❌ Failed to parse GOOGLE_INDEXING_KEY.');
            process.exit(1);
        }
    }
}

if (!key) {
    console.error(`❌ No credentials found (check env var GOOGLE_INDEXING_KEY)`);
    process.exit(1);
}

// THE "NUCLEAR OPTION" FOR THE DECODER ERROR:
// Manually fix common newline and quote issues that break the OpenSSL decoder
const privateKey = key.private_key
    .replace(/\\n/g, '\n')
    .replace(/\n\n/g, '\n')
    .trim();

const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/indexing'],
    null
);

async function indexUrls() {
    console.log('🔗 Starting Google Indexing Ping...');
    
    try {
        await jwtClient.authorize();
        console.log('✅ Google Authentication Successful!');
        const indexing = google.indexing('v3');

        // Extract URLs from sitemap
        if (!fs.existsSync(SITEMAP_PATH)) {
            console.error('❌ sitemap.xml not found! Build SEO must run first.');
            return;
        }

        const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
        const urlRegex = /<loc>(https:\/\/mapledevs\.ca\/.*?)<\/loc>/g;
        let match;
        const urls = [];

        while ((match = urlRegex.exec(sitemap)) !== null) {
            urls.push(match[1]);
        }

        console.log(`🔍 Found ${urls.length} URLs in sitemap.`);

        for (const url of urls) {
            try {
                await new Promise(resolve => setTimeout(resolve, 300)); 
                await indexing.urlNotifications.publish({
                    auth: jwtClient,
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED'
                    }
                });
                console.log(`✅ Indexed: ${url}`);
            } catch (err) {
                console.error(`❌ Failed to index ${url}:`, err.message);
            }
        }
    } catch (err) {
        console.error('❌ Authentication failed:', err.message);
        console.log('💡 HINT: Check if your private key starts with -----BEGIN PRIVATE KEY-----');
    }
}

indexUrls();
