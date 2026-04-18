const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

async function run() {
    console.log('🔗 Starting Google Indexing (Manual-Sign Mode)...');
    
    const rawKey = process.env.GOOGLE_INDEXING_KEY;
    if (!rawKey) {
        console.error('❌ GOOGLE_INDEXING_KEY missing!');
        return;
    }

    let keyData;
    try {
        let sanitized = rawKey.trim().replace(/\s+/g, '');
        if (sanitized.startsWith('"') && sanitized.endsWith('"')) sanitized = sanitized.slice(1, -1);
        if (!sanitized.startsWith('{')) sanitized = Buffer.from(sanitized, 'base64').toString('utf8');
        keyData = JSON.parse(sanitized.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n'));
    } catch (e) {
        console.error('⚠️ Key parsing failed. Using pattern rescue.');
        const emailMatch = /"client_email":\s*"([^"]+)"/.exec(rawKey);
        const keyMatch = /"private_key":\s*"([^"]+)"/.exec(rawKey);
        if (emailMatch && keyMatch) {
            keyData = { 
                client_email: emailMatch[1], 
                private_key: keyMatch[1].replace(/\\\\n/g, '\n').replace(/\\n/g, '\n') 
            };
        }
    }

    if (!keyData || !keyData.private_key) {
        console.error('❌ FATAL: Private key missing.');
        return;
    }

    const clientEmail = keyData.client_email;
    let privateKey = keyData.private_key.trim();
    
    // Convert to PKCS#8 for max compatibility
    privateKey = privateKey.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----');
    privateKey = privateKey.replace(/-----END RSA PRIVATE KEY-----/g, '-----END PRIVATE KEY-----');
    if (!privateKey.includes('-----BEGIN')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
    privateKey = privateKey.split('\\n').join('\n');

    /**
     * MANUAL JWT SIGNING (Bypasses Google Library's OpenSSL 3.0 issues)
     */
    function signJwt() {
        const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
        const now = Math.floor(Date.now() / 1000);
        const payload = Buffer.from(JSON.stringify({
            iss: clientEmail,
            sub: clientEmail,
            aud: 'https://indexing.googleapis.com/',
            iat: now,
            exp: now + 3600,
            scope: 'https://www.googleapis.com/auth/indexing'
        })).toString('base64url');

        const input = `${header}.${payload}`;
        const signature = crypto.createSign('RSA-SHA256')
            .update(input)
            .sign(privateKey, 'base64url');
        
        return `${input}.${signature}`;
    }

    try {
        const jwt = signJwt();
        console.log(`✅ Manual JWT generated. Service: ${clientEmail}`);

        if (!fs.existsSync(SITEMAP_PATH)) {
            console.error('❌ sitemap.xml missing!');
            return;
        }

        const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
        const urls = [];
        const urlRegex = /<loc>(https:\/\/mapledevs\.ca\/.*?)<\/loc>/g;
        let match;
        while ((match = urlRegex.exec(sitemap)) !== null) urls.push(match[1]);

        console.log(`🔍 Found ${urls.length} URLs. Pinging Google...`);

        for (const url of urls) {
            try {
                // Post directly to Google REST API
                await axios.post('https://indexing.googleapis.com/v3/urlNotifications:publish', {
                    url: url,
                    type: 'URL_UPDATED'
                }, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`✅ Indexed: ${url}`);
                await new Promise(r => setTimeout(r, 100));
            } catch (err) {
                console.log(`❌ Fail ${url}: ${err.response?.data?.error?.message || err.message}`);
                // If it hits a quota or permission error, we log but keep going
            }
        }
        console.log('✨ Manual Indexing Complete.');
    } catch (err) {
        console.error('❌ Manual Sign Error:', err.message);
    }
}

run().catch(console.error);
