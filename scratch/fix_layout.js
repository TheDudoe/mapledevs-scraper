const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = '  </div></div><div class="detail-col" id="inline-detail-pane"><div class="inline-detail-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg><p>Select a job to see more details</p></div></div></div>\\n  </main>';

const newContent = `  </div>
  <div class="detail-col" id="inline-detail-pane">
    <div class="inline-detail-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
      <p>Select a job to see more details</p>
    </div>
  </div>
</div>
</main>`;

html = html.replace(/  <\/div><\/div><div class="detail-col" id="inline-detail-pane">[\s\S]*?<\/main>/, newContent);

fs.writeFileSync('index.html', html);
console.log('Fixed index.html layout');
