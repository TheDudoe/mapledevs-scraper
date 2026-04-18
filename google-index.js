const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

async function run() {
    console.log('🔗 Starting Google Indexing...');
    
    // 1. Get the Key (from Env or Local File)
    let keyData;
    const rawKey = process.env.GOOGLE_INDEXING_KEY;
    
    if (rawKey) {
        console.log('🔑 Using GOOGLE_INDEXING_KEY from environment.');
        try {
            keyData = JSON.parse(rawKey.trim());
        } catch (e) {
            const decoded = Buffer.from(rawKey.trim(), 'base64').toString('utf8');
            keyData = JSON.parse(decoded);
        }
    } else {
        const localPath = 'c:/Users/wupei/Downloads/mapledevs-493406-92f28ff2a109.json';
        if (fs.existsSync(localPath)) {
            console.log('🔑 Using local key file for testing.');
            keyData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        }
    }

    if (!keyData) {
        console.error('❌ No valid credentials found.');
        return;
    }

    // "Repair" the key string just in case of GitHub mangle
    if (keyData.private_key) {
        keyData.private_key = keyData.private_key.replace(/\\n/g, '\n');
    }

    try {
        // 2. Use the official "fromJSON" method (most robust way to handle keys)
        const auth = google.auth.fromJSON(keyData);
        auth.scopes = ['https://www.googleapis.com/auth/indexing'];
        
        const indexing = google.indexing({ version: 'v3', auth });

        if (!fs.existsSync(SITEMAP_PATH)) {
            console.error('❌ sitemap.xml missing!');
            return;
        }

        const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
        const urls = [];
        const urlRegex = /<loc>(https:\/\/mapledevs\.ca\/.*?)<\/loc>/g;
        let match;
        while ((match = urlRegex.exec(sitemap)) !== null) urls.push(match[1]);

        console.log(`🔍 Pinging ${urls.length} URLs to Google...`);

        for (const url of urls) {
            try {
                await new Promise(r => setTimeout(r, 200));
                await indexing.urlNotifications.publish({
                    requestBody: { url: url, type: 'URL_UPDATED' }
                });
                console.log(`✅ Indexed: ${url}`);
            } catch (err) {
                console.log(`⚠️ Warning for ${url}: ${err.message}`);
                if (err.message.includes('403')) {
                    console.error('🛑 ERROR: Service Account needs "Owner" role in Search Console!');
                    process.exit(1);
                }
            }
        }
        console.log('✨ Google Indexing phase complete.');
    } catch (err) {
        console.error('❌ Google Auth Error:', err.message);
        process.exit(1);
    }
}

run().catch(console.error);
