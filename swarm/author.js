const { updateAgent, askAI } = require('./utils');

async function writeContent(findings) {
    const agentId = 'author';
    await updateAgent(agentId, 'Active', 'Writing blog post draft...');

    if (!findings || findings.length === 0) {
        await updateAgent(agentId, 'Idle', 'No findings to write about.');
        return null;
    }

    const prompt = `You are an expert Canadian Gaming SEO Polisher.
Take this research and create a high-retention blog post.
OUTPUT ONLY a valid JSON object with these keys:
{
  "slug": "lowercase-hyphenated-slug",
  "title": "Catchy Industry Title",
  "meta_description": "SEO optimized description (150 chars)",
  "html_body": "<h2>Section</h2><p>Content...</p>"
}

RESEARCH DATA:
${JSON.stringify(findings, null, 2)}`;

    try {
        const responseText = await askAI(agentId, prompt, 'gemini-pro');
        
        // Clean up JSON if model adds markdown blocks
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const polishedJson = JSON.parse(cleanedText);
            await updateAgent(agentId, 'Idle', `Polished: ${polishedJson.title}`);
            return polishedJson;
        } catch (e) {
            console.error('[Author JSON Error]', e);
            // Fallback
            return {
                slug: 'canadian-gaming-update-' + Date.now(),
                title: 'Industry News Update',
                meta_description: 'The latest from the Canadian gaming scene.',
                html_body: `<p>${responseText}</p>`
            };
        }
    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

module.exports = writeContent;
