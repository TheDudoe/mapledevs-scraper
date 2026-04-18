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

    // Fortress Key Repair — Handles B64, JSON, and PEM mangling
    function repairKey(raw) {
        if (!raw) return null;
        let k = raw.trim();
        // 1. Handle JSON wrapper or escaped JSON string
        if (k.startsWith('{') || k.includes('"private_key"')) {
            try {
                let j;
                try { j = JSON.parse(k); } 
                catch(e) { j = JSON.parse(k.replace(/\\n/g, '\\\\n')); }
                k = j.private_key || k;
                if (!keyData) keyData = j; // Pull email if available
            } catch (e) {
                const m = /"private_key":\s*"([^"]+)"/.exec(k);
                if (m) k = m[1];
            }
        }
        // 2. Handle Base64
        if (!k.includes('-----BEGIN')) {
            try {
                const b = Buffer.from(k.replace(/\s+/g, ''), 'base64').toString('utf-8');
                if (b.includes('-----BEGIN')) k = b;
            } catch (e) {}
        }
        // 3. Wash and Polish PEM
        k = k.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
        k = k.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----');
        k = k.replace(/-----END RSA PRIVATE KEY-----/g, '-----END PRIVATE KEY-----');
        if (!k.includes('-----BEGIN')) {
            k = `-----BEGIN PRIVATE KEY-----\n${k.replace(/\s+/g, '')}\n-----END PRIVATE KEY-----`;
        }
        // Final check for survived escapes
        k = k.split('\\n').join('\n');
        return k;
    }

    const privateKey = repairKey(rawKey);
    if (!privateKey) {
        console.error('❌ FATAL: Private key missing after repair.');
        return;
    }
    
    // Fallback for client email
    const clientEmail = keyData?.client_email || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (!clientEmail) {
        console.error('❌ FATAL: Service account email missing.');
        return;
    }

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
