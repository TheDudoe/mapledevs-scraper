const fs = require('fs');

// ==== 1. Update index.html ====
let html = fs.readFileSync('index.html', 'utf8');

// 1a. Dark Mode
html = html.replace(/--bg-body: #0A0A09;/g, '--bg-body: #0f1115;');
html = html.replace(/--bg-card: #151514;/g, '--bg-card: #16191E;');
html = html.replace(/--bg-elevated: #1A1A18;/g, '--bg-elevated: #1F2329;');
html = html.replace(/--bg-subtle: #1E1E1C;/g, '--bg-subtle: #252A31;');
html = html.replace(/--bg-input: #1C1C1A;/g, '--bg-input: #1B1E24;');
html = html.replace(/--text-1: #EDEDEA;/g, '--text-1: #F0F4F8;');
html = html.replace(/--text-2: #9A9A92;/g, '--text-2: #A0ABC0;');
html = html.replace(/--text-3: #5A5A54;/g, '--text-3: #6B778C;');
html = html.replace(/--glass: rgba\(21,21,20,0\.82\);/g, '--glass: rgba(22,25,30,0.85);');

// 1b. Gold Color
html = html.replace(/--gold: #C79231;/g, '--gold: #FFD600;');
html = html.replace(/color:#d4af37/g, 'color:#8a6400');
html = html.replace(/border-color:#d4af37/g, 'border-color:#F5C211');

// 1c. Split Layout CSS
const splitCss = `
.split-layout { display: flex; gap: 24px; align-items: flex-start; }
.list-col { flex: 1; min-width: 0; }
.detail-col { display: none; width: 45%; position: sticky; top: calc(var(--header-h) + 20px); max-height: calc(100vh - var(--header-h) - 40px); overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-m); }
@media (min-width: 900px) { .detail-col { display: block; } }
.inline-detail-empty { padding: 80px 20px; text-align: center; color: var(--text-3); font-size: 1.1rem; }
.detail-col .d-card { box-shadow: none; border: none; margin: 0; }
.jc.active { border-color: var(--maple); background: var(--bg-elevated); }
`;
html = html.replace('</style>', splitCss + '\n</style>');

// 1d. Split Layout HTML
html = html.replace('<div id="job-list">', '<div class="split-layout"><div class="list-col"><div id="job-list">');
html = html.replace('</main>', '</div></div><div class="detail-col" id="inline-detail-pane"><div class="inline-detail-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg><p>Select a job to see more details</p></div></div></div>\n  </main>');

// 1e. openDet functionality
const oldOpenDet = 'function openDet(idx,e){history.pushState({idx},"","#job-"+idx);const j=ALL[idx];hideAll();document.getElementById("detail-view").classList.add("on");document.body.classList.add(\'detail-actions-open\');';
const newOpenDet = `function openFullDet(idx, e){ if(e)e.preventDefault(); history.pushState({idx},"","#job-"+idx);const j=ALL[idx];hideAll();document.getElementById("detail-view").classList.add("on");document.body.classList.add('detail-actions-open');`;

html = html.replace(oldOpenDet, newOpenDet);

const newOpenDetFn = `
function openDet(idx, e) {
  if(e) e.preventDefault();
  if(window.innerWidth >= 900) {
    const pane = document.getElementById('inline-detail-pane');
    if(pane) {
      const j = ALL[idx];
      pane.innerHTML = '<div class="d-card">' + detailHTML(j, idx) + '</div>';
      pane.scrollTop = 0;
      document.querySelectorAll('.jc').forEach(el => el.classList.remove('active'));
      const card = e && e.currentTarget && e.currentTarget.classList.contains('jc') ? e.currentTarget : document.querySelector('.jc[aria-label*="'+esc(j.title)+'"]');
      if(card) card.classList.add('active');
      history.pushState({v:'detail',idx}, "", latestJobHref(idx));
      return;
    }
  }
  openFullDet(idx, e);
}
`;
html = html.replace(/function openFullDet\(idx, e\)\{/g, newOpenDetFn + `\nfunction openFullDet(idx, e){`);

// Update the "Details" button inside cards
html = html.replace(/onclick="openDet\(\$\{ri\},event\);event\.stopPropagation\(\)"/g, 'onclick="openFullDet(${ri},event);event.stopPropagation()"');

// 1f. E-Transfer UI in index.html
html = html.replace(/msg\.innerHTML = `<b>Submitted\.<\/b><br><br><b>To complete your job posting/g, 'msg.innerHTML = `<div class="success-box" style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:left;"><b>✅ Submitted successfully!</b><p style="margin:12px 0;">To complete your job posting, please follow these steps:</p><ol style="margin:0 0 16px;padding-left:20px;color:var(--text-2);"><li>Send an Interac e-Transfer to <b>wupeiheng11@gmail.com</b></li><li>Amount: <b>');
html = html.replace(/wupeiheng11@gmail\.com<br><br><b>Amount:<\/b><br>• \$\{tName\}: \$\{amt\}<br><br><b>IMPORTANT:<\/b><br>Include your job title or studio name in the message so we can match your payment\.<br><br>Once payment is received, your listing will be manually approved and published\.`;/g, '${amt}</b> (${tName})</li><li><b>IMPORTANT:</b> Include your job title or studio name in the e-Transfer message.</li></ol><p style="margin:0;font-size:0.95rem;color:var(--text-3);">Once payment is received, your listing will be manually approved and published.</p></div>`;');

fs.writeFileSync('index.html', html);
console.log('Modified index.html');


// ==== 2. Update hire/index.html ====
let hireHtml = fs.readFileSync('hire/index.html', 'utf8');
hireHtml = hireHtml.replace(/--gold: #C79231;/g, '--gold: #FFD600;');
hireHtml = hireHtml.replace(/<li>Standard listing in the feed<\/li>\s*<li>Basic visibility<\/li>\s*<li>Great for general roles<\/li>/g, '<li>Standard listing in the feed</li><li>Searchable via all filters</li><li>Considered for weekly newsletter</li><li>7-day initial highlight</li><li>Great for general roles</li>');

// Extract the form and CSS from index.html to put in hire/index.html
const formRegex = /<form id="post-form" class="post-form"[\s\S]*?<\/form>/;
const formMatch = html.match(formRegex);

if (formMatch) {
  const formHtml = formMatch[0];
  
  const customFormCss = `
  <style>
    .post-form-container { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 40px; max-width: 700px; margin: 0 auto; }
    .post-form { display: grid; gap: 20px; text-align: left; }
    .fg { display: flex; flex-direction: column; gap: 8px; }
    .fg.full { grid-column: 1 / -1; }
    .fg label { font-weight: 600; color: var(--ink); font-size: 0.95rem; }
    .fg input[type="text"], .fg input[type="url"], .fg input[type="email"], .fg select, .fg textarea { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); font-family: inherit; font-size: 1rem; color: var(--ink); }
    .fg input:focus, .fg select:focus, .fg textarea:focus { outline: 2px solid var(--maple); border-color: transparent; }
    .option-row { display: flex; gap: 12px; align-items: flex-start; background: var(--paper); padding: 16px; border-radius: 8px; border: 1px solid var(--line); cursor: pointer; transition: 0.2s; }
    .option-row:hover { border-color: var(--maple); }
    .option-row input { margin-top: 4px; accent-color: var(--maple); width: 18px; height: 18px; }
    .option-row span { font-size: 0.95rem; color: var(--ink-soft); }
    .option-row strong { color: var(--ink); font-size: 1rem; }
    .policy-note { display: block; margin-top: 8px; font-size: 0.85rem; color: var(--muted); }
    .form-submit { margin-top: 10px; text-align: center; }
    .btn-p { display: inline-block; background: var(--maple); color: #fff; padding: 14px 28px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer; font-size: 1.05rem; }
    .btn-p:hover { background: var(--maple-dark); }
    .form-msg { margin-bottom: 20px; font-size: 1rem; display: none; }
    .form-msg.show { display: block; }
    .form-msg.err { color: var(--maple); }
  </style>
  `;
  
  // Replace the final CTA buttons and content with the inline form
  const replacementTarget = /<div class="final-cta">[\s\S]*?<\/div>/;
  const newFinalCta = `
  ${customFormCss}
  <div class="final-cta" id="post-section">
    <h2>Post your job and start reaching Canadian game developers today</h2>
    <div class="post-form-container">
      ${formHtml}
    </div>
  </div>
  <script>
    function submitPostForm(e){
      e.preventDefault();
      const form=document.getElementById('post-form');
      const btn=document.getElementById('post-submit-btn');
      const msg=document.getElementById('post-msg');
      btn.disabled=true; btn.textContent='Sending…';
      msg.className='form-msg'; msg.style.display='none';

      const data=new FormData(form);
      fetch('https://formsubmit.co/ajax/mapledevsbusiness@gmail.com',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(Object.fromEntries(data))
      }).then(r=>r.json()).then(d=>{
        if(d.success){
          msg.className='form-msg show'; 
          const tierVal = form.querySelector('input[name="Tier"]:checked').value;
          if (tierVal === 'free') {
            msg.innerHTML = '<b>Submitted.</b> Your job has been sent for manual review and will be published shortly.';
          } else {
            const amt = tierVal === 'hiring_boost' ? '$39 CAD' : '$19 CAD';
            const tName = tierVal === 'hiring_boost' ? 'Hiring Boost' : 'Featured';
            msg.innerHTML = \`<div class="success-box" style="background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:24px;text-align:left;"><b>✅ Submitted successfully!</b><p style="margin:12px 0;">To complete your job posting, please follow these steps:</p><ol style="margin:0 0 16px;padding-left:20px;color:var(--ink-soft);"><li>Send an Interac e-Transfer to <b>wupeiheng11@gmail.com</b></li><li>Amount: <b>\${amt}</b> (\${tName})</li><li><b>IMPORTANT:</b> Include your job title or studio name in the e-Transfer message.</li></ol><p style="margin:0;font-size:0.95rem;color:var(--muted);">Once payment is received, your listing will be manually approved and published.</p></div>\`;
          }
          form.reset();
        } else { throw 0; }
      }).catch(()=>{
        msg.className='form-msg show err'; msg.innerHTML='⚠ Error — try emailing mapledevsbusiness@gmail.com directly.';
      }).finally(()=>{
        btn.disabled=false; btn.textContent='Submit for Review →';
      });
      return false;
    }
    
    // Auto-select tier based on button clicks
    function selectTier(val) {
      document.querySelector('input[name="Tier"][value="'+val+'"]').checked = true;
      document.getElementById('post-section').scrollIntoView({behavior: 'smooth'});
    }
  </script>
  `;
  
  hireHtml = hireHtml.replace(replacementTarget, newFinalCta);
  
  // Update the pricing table buttons to auto-select and scroll down
  hireHtml = hireHtml.replace(/onclick="window\.location\.href='\.\.\/index\.html#post'"/g, '');
  hireHtml = hireHtml.replace(/>Post Free<\/button>/g, 'onclick="selectTier(\'free\')">Post Free</button>');
  hireHtml = hireHtml.replace(/>Get Featured<\/button>/g, 'onclick="selectTier(\'featured\')">Get Featured</button>');
  hireHtml = hireHtml.replace(/>Boost Job<\/button>/g, 'onclick="selectTier(\'hiring_boost\')">Boost Job</button>');
  hireHtml = hireHtml.replace(/>Post a Job<\/button>/g, 'onclick="document.getElementById(\'post-section\').scrollIntoView({behavior: \'smooth\'})">Post a Job</button>');
  hireHtml = hireHtml.replace(/>Post a Job Now<\/button>/g, 'onclick="document.getElementById(\'post-section\').scrollIntoView({behavior: \'smooth\'})">Post a Job Now</button>');
  
  // Remove the redirect script
  hireHtml = hireHtml.replace(/<script>\s*if\(window\.location\.hash === '#post'\) \{[\s\S]*?\}<\/script>/, '');
  
  fs.writeFileSync('hire/index.html', hireHtml);
  console.log('Modified hire/index.html');
}

// ==== 3. About Page Animations & Consistency ====
// The user asked for "about page to have some more motions when you scroll"
// The about content is actually inside index.html (#about-view)
let aboutCss = `
.about-reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.about-reveal.visible { opacity: 1; transform: translateY(0); }
.about-card { transition: transform 0.3s; }
.about-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-m); border-color: var(--maple); }
`;
html = html.replace('</style>', aboutCss + '\n</style>');

const aboutObserverJs = `
const aboutObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, {threshold: 0.1});
document.querySelectorAll('.about-reveal').forEach(el => aboutObs.observe(el));
`;
// We will just add the observer JS to the bottom of the script
html = html.replace('</script>\n</body>', aboutObserverJs + '\n</script>\n</body>');
fs.writeFileSync('index.html', html);
console.log('Added about page animations');
