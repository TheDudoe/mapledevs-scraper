const { updateAgent, askAI } = require('./utils');

/**
 * SEO Specialist Agent
 * Optimizes the Polisher's JSON for search engines without altering HTML structure.
 */
async function optimizeContent(polishedJson) {
    const agentId = 'optimizer';
    await updateAgent(agentId, 'Active', 'Applying SEO optimizations...');

    if (!polishedJson) return null;

    const prompt = `
        You are the SEO Specialist for MapleDevs. Optimize the following JSON blog payload.
        
        INPUT JSON:
        ${JSON.stringify(polishedJson, null, 2)}

        TASKS:
        1. Improve the "meta_description" to be highly clickable (max 155 chars).
        2. Ensure the "slug" is clean and keyword-rich.
        3. Do NOT alter the "html_body" or "title".
        
        OUTPUT ONLY THE UPDATED JSON.
    `;

    try {
        const aiResponse = await askAI(agentId, prompt, 'gemini-1.5-flash');
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const optimization = jsonMatch ? JSON.parse(jsonMatch[0]) : polishedJson;

        // Ensure we keep the html_body from the polisher
        optimization.html_body = polishedJson.html_body;
        optimization.title = polishedJson.title;

        await updateAgent(agentId, 'Idle', `SEO Optimized: ${optimization.slug}`);
        return optimization;
    } catch (error) {
        console.error('[Optimizer Error]', error);
        await updateAgent(agentId, 'Idle', 'SEO Optimization Error');
        // Return original if AI fails
        return polishedJson;
    }
}

module.exports = optimizeContent;
