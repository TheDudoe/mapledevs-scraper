const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

async function run() {
    console.log('🔗 Starting Google Indexing (Universal Crypto Mode)...');
    
    const rawKey = process.env.GOOGLE_INDEXING_KEY;
    if (!rawKey) {
        console.error('❌ GOOGLE_INDEXING_KEY not found!');
        return;
    }

    let keyData;
    try {
        let sanitized = rawKey.trim();
        if (sanitized.startsWith('"') && sanitized.endsWith('"')) sanitized = sanitized.slice(1, -1);
        
        // Handle Base64 vs Raw JSON
        if (!sanitized.startsWith('{')) {
            sanitized = Buffer.from(sanitized, 'base64').toString('utf8');
        }
        
        // Fix mangled newlines
        keyData = JSON.parse(sanitized.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n'));
    } catch (e) {
        // Pattern-based rescue
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
        console.error('❌ FATAL: Key extraction failed.');
        return;
    }

    // 🧬 THE UNIVERSAL CRYPTO REPAIR 🧬
    // Convert PKCS#1 (RSA) to PKCS#8 (Standard)
    // PKCS#1: -----BEGIN RSA PRIVATE KEY-----
    // PKCS#8: -----BEGIN PRIVATE KEY----- (This is what OpenSSL 3.0 wants)
    let pk = keyData.private_key.trim();
    
    // 1. Remove "RSA" from headers to force PKCS#8 interpretation
    pk = pk.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----');
    pk = pk.replace(/-----END RSA PRIVATE KEY-----/g, '-----END PRIVATE KEY-----');
    
    // 2. Ensure internal structure is clean
    if (!pk.includes('-----BEGIN')) {
        pk = `-----BEGIN PRIVATE KEY-----\n${pk}\n-----END PRIVATE KEY-----`;
    }
    pk = pk.split('\\n').join('\n');

    console.log(`📧 Agent: ${keyData.client_email}`);

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

        console.log(`🔍 Ping ${urls.length} URLs...`);

        for (const url of urls) {
            try {
                await indexing.urlNotifications.publish({
                    requestBody: { url: url, type: 'URL_UPDATED' }
                });
                console.log(`✅ Indexed: ${url}`);
            } catch (err) {
                console.log(`❌ Fail ${url}: ${err.message}`);
                // If it still fails, it's likely a Search Console permission issue, not a key issue
            }
        }
    } catch (err) {
        console.error('❌ Crypto/Auth Error:', err.message);
    }
}

run().catch(console.error);
