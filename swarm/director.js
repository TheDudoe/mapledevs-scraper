const fs = require('fs-extra');
const path = require('path');
const { updateState, updateAgent } = require('./utils');

async function publish(contentPackage) {
    const agentId = 'director';
    await updateAgent(agentId, 'Active', 'Publishing content...');

    const ROOT_DIR = path.join(__dirname, '..');
    const BLOG_DIR = path.join(ROOT_DIR, 'blog');

    try {
        // 1. Handle Blog Post
        if (contentPackage.blog) {
            const { slug, final_markdown } = contentPackage.blog;
            const postDir = path.join(BLOG_DIR, slug);
            await fs.ensureDir(postDir);

            // Save the markdown
            await fs.writeFile(path.join(postDir, 'content.md'), final_markdown);
            
            // Create a simple index.html for the post
            const html = `<!DOCTYPE html><html><head><title>${slug}</title></head><body><div id="content">${final_markdown}</div></body></html>`;
            await fs.writeFile(path.join(postDir, 'index.html'), html);
            
            // 1b. Update main index.html ticker
            const indexPath = path.join(ROOT_DIR, 'index.html');
            if (await fs.pathExists(indexPath)) {
                let indexContent = await fs.readFile(indexPath, 'utf8');
                
                // Extract title from markdown
                const titleMatch = final_markdown.match(/^# (.*)/m) || final_markdown.match(/title: "(.*)"/);
                const title = titleMatch ? titleMatch[1] : 'New Industry Update';

                // Replace title and link
                indexContent = indexContent.replace(/id="latest-news-title">.*?<\/span>/, `id="latest-news-title">${title}</span>`);
                indexContent = indexContent.replace(/id="latest-news-link" href=".*?"/, `id="latest-news-link" href="/blog/${slug}"`);
                
                await fs.writeFile(indexPath, indexContent);
                console.log(`[Director] Updated website ticker with: ${title}`);
            }

            console.log(`[Director] Published blog post: ${slug}`);
        }

        // 2. Update Stats
        const state = await fs.readJson(path.join(__dirname, 'state.json'));
        state.stats.blogs_written += contentPackage.blog ? 1 : 0;
        state.stats.jobs_approved += contentPackage.approvedCount || 0;
        state.last_run = new Date().toISOString();
        state.status = 'idle';
        await updateState(state);

        await updateAgent(agentId, 'Idle', 'All systems synchronized.');
        
    } catch (error) {
        await updateAgent(agentId, 'Idle', `Error: ${error.message}`);
        throw error;
    }
}

module.exports = publish;
