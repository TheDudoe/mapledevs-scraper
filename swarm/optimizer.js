const { updateAgent, askAI } = require('./utils');
const slugify = require('slugify');

async function optimizeContent(draft) {
    const agentId = 'optimizer';
    await updateAgent(agentId, 'Active', 'Optimizing for SEO...');

    const prompt = `
        You are the SEO Specialist for MapleDevs. Optimize the following blog post.
        
        Post Content:
        ${draft}

        Tasks:
        1. Create an SEO-friendly URL slug.
        2. Write a meta description (max 155 chars).
        3. Identify 5-7 primary keywords.
        4. Suggest 3 internal links to other parts of MapleDevs (e.g. /toronto, /junior, /internship).

        Return the result as JSON:
        {
            "slug": "...",
            "meta_description": "...",
            "keywords": [...],
            "internal_links": [...],
            "final_markdown": "..." (the markdown with meta tags at the top)
        }
    `;

    try {
        const aiResponse = await askAI(agentId, prompt, 'gemini-1.5-flash');
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const optimization = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        // Fallback slug if AI fails
        if (!optimization.slug) {
            const titleMatch = draft.match(/^# (.*)/m);
            const title = titleMatch ? titleMatch[1] : 'canadian-gaming-news';
            optimization.slug = slugify(title, { lower: true, strict: true });
        }

        await updateAgent(agentId, 'Idle', `Optimization complete. Slug: ${optimization.slug}`);
        return optimization;
    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

module.exports = optimizeContent;
