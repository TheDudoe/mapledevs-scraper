const fs = require('fs-extra');
const path = require('path');

const BANNED_TERMS = ['Swarm', 'AI-Powered', 'Intelligence'];
const BANNED_STYLES = ['#00f2ff', '#7000ff', 'Outfit'];
const BLOG_DIR = path.join(__dirname, 'blog');
const TEMPLATE_PATH = path.join(__dirname, 'blog-template.html');

async function validate() {
    let errors = [];

    // 1. Check Template
    if (!await fs.pathExists(TEMPLATE_PATH)) {
        errors.push('MISSING: blog-template.html is missing.');
    } else {
        const template = await fs.readFile(TEMPLATE_PATH, 'utf-8');
        if (!template.includes('{{CONTENT}}')) errors.push('TEMPLATE_CORRUPT: {{CONTENT}} marker not found.');
    }

    // 2. Check for Flat Files & Banned Content
    const files = await fs.readdir(BLOG_DIR);
    for (const file of files) {
        const fullPath = path.join(BLOG_DIR, file);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
            // Exceptions: admin, scratch, etc. But if it's a blog post folder, it's a fail.
            if (file !== 'index.html' && !file.endsWith('.html') && file !== 'archive') {
                // If it contains an index.html, it's a nested post
                if (await fs.pathExists(path.join(fullPath, 'index.html'))) {
                    errors.push(`NESTED_ROUTING: Found nested blog folder /blog/${file}/. Please flatten to /blog/${file}.html.`);
                }
            }
        } else if (file.endsWith('.html')) {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Check Banned Styles
            for (const style of BANNED_STYLES) {
                if (content.includes(style)) errors.push(`BANNED_STYLE: Found '${style}' in /blog/${file}`);
            }

            // Check Banned Branding
            for (const term of BANNED_TERMS) {
                const regex = new RegExp(term, 'gi');
                if (regex.test(content)) errors.push(`BANNED_BRANDING: Found '${term}' in /blog/${file}`);
            }
        }
    }

    // 3. Check Homepage Links
    const indexPath = path.join(__dirname, 'index.html');
    if (await fs.pathExists(indexPath)) {
        const indexContent = await fs.readFile(indexPath, 'utf-8');
        const tickerMatch = indexContent.match(/href="\/blog\/([^"]+)"/);
        if (tickerMatch) {
            const linkedFile = path.join(BLOG_DIR, tickerMatch[1].replace('/blog/', ''));
            if (!linkedFile.endsWith('.html')) errors.push(`INVALID_LINK: Ticker links must use .html extension.`);
        }
    }

    if (errors.length > 0) {
        console.error('❌ VALIDATION FAILED:');
        errors.forEach(e => console.error(` - ${e}`));
        process.exit(1);
    } else {
        console.log('✅ VALIDATION PASSED: Blog pipeline is safe and branded.');
    }
}

validate().catch(err => {
    console.error(err);
    process.exit(1);
});
