const fs = require('fs');
const { google } = require('googleapis');

const KEY_FILE = 'C:\\Users\\wupei\\Downloads\\mapledevs-493406-b074afdf8d68.json';

async function findSpreadsheet() {
    const credentials = JSON.parse(fs.readFileSync(KEY_FILE));
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });
    
    try {
        const res = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name)',
        });
        const files = res.data.files;
        if (files.length) {
            console.log('✅ Found spreadsheets:');
            files.forEach(f => console.log(`- ${f.name} (ID: ${f.id})`));
        } else {
            console.log('❌ No spreadsheets found for this service account.');
        }
    } catch (e) {
        console.log('❌ Error listing files:', e.message);
    }
}
findSpreadsheet();
