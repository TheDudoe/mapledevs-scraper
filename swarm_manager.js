const scout = require('./swarm/scout');
const reviewer = require('./swarm/reviewer');
const author = require('./swarm/author');
const optimizer = require('./swarm/optimizer');
const director = require('./swarm/director');
const { updateState } = require('./swarm/utils');
const fs = require('fs-extra');
const path = require('path');

async function runSwarm(options = {}) {
    console.log('🐝 Starting MapleDevs Swarm Intelligence...');
    
    try {
        await updateState({ status: 'active', active_agents: ['scout'] });

        // Phase 1: Research (Scout)
        const findings = await scout();
        
        // Phase 2: Review (Gatekeeper)
        // This agent interacts with Google Sheets
        const reviewResult = await reviewer();

        // Phase 3: Writing (Author)
        await new Promise(r => setTimeout(r, 10000));
        const draft = await author(findings);
        console.log(`[Manager] Polisher generated draft for: ${draft?.title}`);
        if (!draft) return;

        // Phase 4: SEO (Optimizer)
        await new Promise(r => setTimeout(r, 10000));
        const optimizedBlog = await optimizer(draft);
        console.log(`[Manager] Optimizer generated slug: ${optimizedBlog?.slug}`);

        // Phase 5: Publishing (Director)
        await new Promise(r => setTimeout(r, 10000));
        if (!options.dryRun) {
            await director({
                blog: optimizedBlog,
                approvedCount: reviewResult?.approvedCount || 0
            });
            console.log('✅ Swarm cycle complete. Website updated.');
        } else {
            console.log('🧪 DRY RUN: No files were written.');
            console.log('Optimized Blog Slug:', optimizedBlog.slug);
            await updateState({ status: 'idle' });
        }

    } catch (error) {
        console.error('❌ Swarm execution failed:', error.message);
        await updateState({ status: 'error', last_error: error.message });
    }
}

// CLI Entry Point
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

runSwarm({ dryRun: isDryRun });
