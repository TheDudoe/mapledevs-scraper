const { getSheets, updateAgent, askAI } = require('./utils');
require('dotenv').config();

async function reviewJobs() {
    const agentId = 'reviewer';
    await updateAgent(agentId, 'Active', 'Connecting to Google Sheets...');

    let sheets;
    try {
        sheets = await getSheets();
    } catch (e) {
        await updateAgent(agentId, 'Idle', 'Skipping: Google credentials missing.');
        console.log('[Reviewer] Skipping sheet review: Google credentials missing.');
        return { approvedCount: 0, rejectedCount: 0 };
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'jobs_review';

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        const headers = rows[0];
        const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');
        const titleIdx = headers.findIndex(h => h.toLowerCase().includes('title'));
        const studioIdx = headers.findIndex(h => h.toLowerCase().includes('studio'));
        const descIdx = headers.findIndex(h => h.toLowerCase().includes('description'));
        const locIdx = headers.findIndex(h => h.toLowerCase().includes('location'));

        let approvedCount = 0;
        let rejectedCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const currentStatus = (row[statusIdx] || '').toLowerCase();

            if (currentStatus === 'needs_review' || currentStatus === 'new') {
                const jobTitle = row[titleIdx];
                const studio = row[studioIdx];
                const desc = row[descIdx];
                const loc = row[locIdx];

                await updateAgent(agentId, 'Thinking', `Reviewing: ${jobTitle} at ${studio}`);

                const prompt = `
                    You are the Gatekeeper for MapleDevs, a premium job board for the Canadian gaming industry.
                    Decide if this job should be approved for the website.

                    Criteria for Approval:
                    1. Must be in the Gaming/Game Dev industry.
                    2. Must be located in Canada (or remote for a Canadian studio).
                    3. Must have a clear, professional title and description.
                    4. No spam or irrelevant roles (e.g. non-tech, non-creative roles like 'Janitor').

                    Job Data:
                    Title: ${jobTitle}
                    Studio: ${studio}
                    Location: ${loc}
                    Description: ${desc}

                    Response format:
                    DECISION: [APPROVE/REJECT]
                    REASON: [Short 1-sentence reason]
                `;

                const aiResponse = await askAI(agentId, prompt, 'gemini-pro');
                const decision = aiResponse.includes('APPROVE') ? 'approved' : 'rejected';

                // Update the sheet
                const range = `${sheetName}!${String.fromCharCode(65 + statusIdx)}${i + 1}`;
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: [[decision]] },
                });

                if (decision === 'approved') approvedCount++;
                else rejectedCount++;

                console.log(`[Reviewer] ${jobTitle} at ${studio} -> ${decision}`);
            }
        }

        await updateAgent(agentId, 'Idle', `Finished. Approved: ${approvedCount}, Rejected: ${rejectedCount}`);
        return { approvedCount, rejectedCount };

    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

if (require.main === module) {
    reviewJobs();
}

module.exports = reviewJobs;
