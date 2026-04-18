const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

async function run() {
    console.log('🔗 Starting Google Indexing (Sanitized Mode)...');
    
    let keyData;
    const rawKey = process.env.GOOGLE_INDEXING_KEY;
    
    if (rawKey) {
        try {
            // First, try to handle multiple layers of escaping from GitHub
            let sanitized = rawKey.trim();
            if (sanitized.startsWith('"') && sanitized.endsWith('"')) sanitized = sanitized.slice(1, -1);
            keyData = JSON.parse(sanitized.replace(/\\n/g, '\n'));
        } catch (e) {
            console.error('⚠️ Key parsing failed, attempting repair...');
            // Fallback for raw JSON mangling
            const keyMatch = /"private_key":\s*"(.*?)"/.exec(rawKey);
            if (keyMatch) {
                keyData = { 
                    private_key: keyMatch[1].replace(/\\n/g, '\n'),
                    client_email: (/"client_email":\s*"(.*?)"/.exec(rawKey) || [])[1]
                };
            }
        }
    }

    if (!keyData || !keyData.private_key) {
        console.error('❌ Could not recover private key from environment.');
        return;
    }

    // SURGICAL PEM REPAIR
    let pk = keyData.private_key.trim();
    if (!pk.includes('-----BEGIN')) {
        // If it's just the raw base64, wrap it
        pk = `-----BEGIN PRIVATE KEY-----\n${pk}\n-----END PRIVATE KEY-----`;
    }

    try {
        const auth = google.auth.fromJSON({
            client_email: keyData.client_email,
            private_key: pk
        });
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

        console.log(`🔍 Found ${urls.length} URLs. Authenticating...`);

        for (const url of urls) {
            try {
                await new Promise(r => setTimeout(r, 100));
                await indexing.urlNotifications.publish({
                    requestBody: { url: url, type: 'URL_UPDATED' }
                });
                console.log(`✅ Indexed: ${url}`);
            } catch (err) {
                console.log(`⚠️ Skip ${url}: ${err.message}`);
                if (err.message.includes('403')) {
                    console.error('🛑 Search Console ownership missing for the service account email!');
                    break;
                }
            }
        }
    } catch (err) {
        console.error('❌ Auth Error:', err.message);
    }
}

run().catch(console.error);
