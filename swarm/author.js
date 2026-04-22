const { updateAgent, askAI } = require('./utils');

async function writeContent(findings) {
    const agentId = 'author';
    await updateAgent(agentId, 'Active', 'Writing blog post draft...');

    if (!findings || findings.length === 0) {
        await updateAgent(agentId, 'Idle', 'No findings to write about.');
        return null;
    }

    const prompt = `
        You are the Head Writer for MapleDevs. Write a "Weekly Canadian Gaming Round-up" blog post.
        
        Use these findings:
        ${JSON.stringify(findings, null, 2)}

        Guidelines:
        1. Tone: Professional, optimistic, and deeply Canadian.
        2. Format: Markdown.
        3. Structure: 
           - Catchy Title
           - Intro summarizing the week.
           - Section for each major finding.
           - "What this means for job seekers" section.
           - Conclusion with a call to action to check MapleDevs.
        
        Return the content in Markdown format.
    `;

    try {
        const content = await askAI(agentId, prompt, 'gemini-pro');
        await updateAgent(agentId, 'Idle', 'Blog post draft completed.');
        return content;
    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

module.exports = writeContent;
