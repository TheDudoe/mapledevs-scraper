const { updateAgent, askAI } = require('./utils');

async function researchIndustry() {
    const agentId = 'scout';
    await updateAgent(agentId, 'Active', 'Searching for Canadian gaming news...');

    // In a real scenario, this would call a search API.
    // For now, we use Gemini's internal knowledge updated with recent context.
    const prompt = `
        You are the Scout for MapleDevs. Research the latest news (April 2026) in the Canadian Gaming Industry.
        Focus on:
        1. New studio openings or major project announcements in Canada.
        2. Major mergers/acquisitions (e.g. Behaviour Interactive).
        3. Significant industry shifts (e.g. Alberta's new gaming market, Ontario milestones).
        4. Trends in hiring or layoffs at major Canadian studios (Ubisoft, EA, Eidos, etc).

        Return a JSON array of "findings". Each finding should have:
        - title: Short headline
        - category: (News/Trend/Job Opportunity)
        - summary: 2-3 sentences of details.
        - impact: Why this matters for Canadian developers.
    `;

    try {
        const aiResponse = await askAI(agentId, prompt, 'gemini-pro');
        
        // Extract JSON from markdown if needed
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        const findings = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        await updateAgent(agentId, 'Idle', `Found ${findings.length} industry updates.`);
        return findings;
    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

if (require.main === module) {
    researchIndustry();
}

module.exports = researchIndustry;
