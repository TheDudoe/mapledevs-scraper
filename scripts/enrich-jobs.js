const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration
const SHEET_ID = '1L2KcTO32jK5MVY1m3qdqdja7LTZ38f8lYXsK5mNMMDo';
const DRY_RUN = false; // Set to false to apply changes
const KEY_FILE = 'C:\\Users\\wupei\\Downloads\\mapledevs-493406-b074afdf8d68.json';

function guessEngine(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    if (/\bunreal\b|ue4|ue5/i.test(text)) return 'Unreal';
    if (/\bunity\b/i.test(text)) return 'Unity';
    if (/\bfrostbite\b/i.test(text)) return 'Frostbite';
    if (/\bsnowdrop\b/i.test(text)) return 'Snowdrop';
    if (/\bgodot\b/i.test(text)) return 'Godot';
    if (/\blumberyard\b/i.test(text)) return 'Lumberyard';
    if (/\bdecima\b/i.test(text)) return 'Decima';
    if (/\bcryengine\b/i.test(text)) return 'CryEngine';
    if (/\bredengine\b/i.test(text)) return 'RedEngine';
    if (/\bre engine\b/i.test(text)) return 'RE Engine';
    if (/\bnorthlight\b/i.test(text)) return 'Northlight';
    
    if (text.includes('c++') || text.includes('engine programmer')) return 'C++ / Proprietary';
    
    return '';
}

function guessVisa(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    const positiveKeywords = [
        'relocation assistance', 'relocation support', 'sponsorship', 'visa sponsorship', 
        'work permit', 'lmia', 'provincial nominee', 'pnp', 'international candidates',
        'global talent stream', 'can help with relocation'
    ];
    for (const kw of positiveKeywords) {
        if (text.includes(kw)) return 'Yes';
    }
    return '';
}

async function enrich() {
    const credentials = JSON.parse(fs.readFileSync(KEY_FILE));
    
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = SHEET_ID;
    
    console.log('📊 Fetching current data...');
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
        console.log('No data found.');
        return;
    }

    const header = rows[0];
    const updates = [];
    let updatedCount = 0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const title = row[0] || '';
        const studio = row[1] || '';
        const desc = row[5] || '';
        const currentEngine = row[11] || '';
        const currentVisa = row[12] || '';

        let newEngine = currentEngine;
        let newVisa = currentVisa;

        // Only fill if empty
        if (!currentEngine || currentEngine.trim() === '') {
            newEngine = guessEngine(title, desc);
        }

        if (!currentVisa || currentVisa.trim() === '' || currentVisa.trim() === 'No') {
            const guessedVisa = guessVisa(title, desc);
            if (guessedVisa) newVisa = guessedVisa;
        }

        if (newEngine !== currentEngine || newVisa !== currentVisa) {
            updatedCount++;
            console.log(`[${i}] Updating ${title} at ${studio}...`);
            if (newEngine !== currentEngine) console.log(`  Engine: ${currentEngine || '(none)'} -> ${newEngine}`);
            if (newVisa !== currentVisa) console.log(`  Visa: ${currentVisa || '(none)'} -> ${newVisa}`);
            
            // Prepare update
            updates.push({
                range: `Sheet1!L${i + 1}:M${i + 1}`,
                values: [[newEngine, newVisa]]
            });
        }
    }

    if (updates.length > 0) {
        if (DRY_RUN) {
            console.log(`\n✨ [DRY RUN] Would apply ${updates.length} updates to the spreadsheet.`);
        } else {
            console.log(`\n🚀 Applying ${updates.length} updates...`);
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                resource: {
                    valueInputOption: 'USER_ENTERED',
                    data: updates
                }
            });
            console.log('✅ Spreadsheet enriched successfully!');
        }
    } else {
        console.log('\n✨ No new information could be inferred.');
    }
}

enrich().catch(err => {
    console.error('Fatal error:', err);
    if (err.message.includes('404')) {
        console.log('\nTIP: The Spreadsheet ID might be incorrect. Please check your GOOGLE_SHEET_ID environment variable.');
    }
});
