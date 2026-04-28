const fs = require('fs');
const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

// Find the last </html> tag
const lastHtmlIndex = content.lastIndexOf('</html>');
if (lastHtmlIndex !== -1) {
  content = content.substring(0, lastHtmlIndex + 7);
}

// Find the first </body> tag
const firstBodyEndIndex = content.indexOf('</body>');
if (firstBodyEndIndex !== -1) {
    // Check if there is another </body> later
    const lastBodyEndIndex = content.lastIndexOf('</body>');
    if (firstBodyEndIndex !== lastBodyEndIndex) {
        console.log('Duplicated </body> tags found. Cleaning up...');
        // We want to keep everything up to the point before the duplication started.
        // The duplication likely started after the first script block or so.
        
        // Let's find the correct ending.
        // A healthy file ends with the feature banner and then </body></html>.
        const bannerMarker = '<!-- Sticky Feature Banner -->';
        const lastBannerIndex = content.lastIndexOf(bannerMarker);
        if (lastBannerIndex !== -1) {
            const closingPart = content.substring(lastBannerIndex);
            // Now find where the FIRST script block ended before the duplication.
            // Actually, let's just find the first occurrence of the main job board script logic.
            const mainScriptMarker = '/* ═══════════════════════════════════════════════════\n   CONFIG';
            const firstMainScriptIndex = content.indexOf(mainScriptMarker);
            const lastMainScriptIndex = content.lastIndexOf(mainScriptMarker);
            
            if (firstMainScriptIndex !== lastMainScriptIndex) {
                // Duplication detected.
                // Keep everything from start to the end of the first main script block, 
                // then jump to the last banner and closing tags.
                
                // But wait, the main script is huge.
                // Let's find the end of the first main script block.
                // It ends before the next duplicated Privacy/Terms block.
                const privacyMarker = '<!-- ═══════ PRIVACY VIEW ═══════ -->';
                const secondPrivacyIndex = content.indexOf(privacyMarker, firstMainScriptIndex);
                
                if (secondPrivacyIndex !== -1) {
                    const healthyContent = content.substring(0, secondPrivacyIndex) + closingPart;
                    fs.writeFileSync(path, healthyContent);
                    console.log('Cleaned up duplicated content successfully.');
                }
            }
        }
    }
}
