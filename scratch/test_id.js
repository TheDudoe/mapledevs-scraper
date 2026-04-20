const fs = require('fs');
const { google } = require('googleapis');

const KEY_FILE = 'C:\\Users\\wupei\\Downloads\\mapledevs-493406-b074afdf8d68.json';
const SHEET_ID = '1vSkt2ROoihRVsL4f0m4dXZ1IzD7KYzEghgOwW7QPC2EN6sE4D_iI3stfllfdeq61coOrhdi47eeLmoY';

async function test() {
    const credentials = JSON.parse(fs.readFileSync(KEY_FILE));
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
        const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        console.log('✅ Success! Title:', res.data.properties.title);
    } catch (e) {
        console.log('❌ Failed:', e.message);
    }
}
test();
