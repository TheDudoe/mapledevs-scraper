const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
let hireHtml = fs.readFileSync('hire/index.html', 'utf8');

hireHtml = hireHtml.replace(/--gold: #C79231;/g, '--gold: #FFD600;');
hireHtml = hireHtml.replace(/<li>Standard listing in the feed<\/li>\s*<li>Basic visibility<\/li>\s*<li>Great for general roles<\/li>/g, '<li>Standard listing in the feed</li><li>Searchable via all filters</li><li>Considered for weekly newsletter</li><li>7-day initial highlight</li><li>Great for general roles</li>');

const formRegex = /<form id="post-form" class="form-grid"[\s\S]*?<\/form>/;
const formMatch = html.match(formRegex);

if (formMatch) {
  const formHtml = formMatch[0];
  
  const customFormCss = `
  <style>
    .post-form-container { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 40px; max-width: 700px; margin: 0 auto; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
    .form-grid { display: grid; gap: 20px; text-align: left; }
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
            msg.innerHTML = '<div class="success-box" style="background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:24px;text-align:left;"><b>✅ Submitted successfully!</b><p style="margin:12px 0;">Your job has been sent for manual review and will be published shortly.</p></div>';
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
    
    function selectTier(val) {
      document.querySelector('input[name="Tier"][value="'+val+'"]').checked = true;
      document.getElementById('post-section').scrollIntoView({behavior: 'smooth'});
    }
  </script>
  `;
  
  hireHtml = hireHtml.replace(replacementTarget, newFinalCta);
  
  hireHtml = hireHtml.replace(/onclick="window\.location\.href='\.\.\/index\.html#post'"/g, '');
  hireHtml = hireHtml.replace(/>Post Free<\/button>/g, 'onclick="selectTier(\'free\')">Post Free</button>');
  hireHtml = hireHtml.replace(/>Get Featured<\/button>/g, 'onclick="selectTier(\'featured\')">Get Featured</button>');
  hireHtml = hireHtml.replace(/>Boost Job<\/button>/g, 'onclick="selectTier(\'hiring_boost\')">Boost Job</button>');
  hireHtml = hireHtml.replace(/>Post a Job<\/button>/g, 'onclick="document.getElementById(\'post-section\').scrollIntoView({behavior: \'smooth\'})">Post a Job</button>');
  hireHtml = hireHtml.replace(/>Post a Job Now<\/button>/g, 'onclick="document.getElementById(\'post-section\').scrollIntoView({behavior: \'smooth\'})">Post a Job Now</button>');
  
  hireHtml = hireHtml.replace(/<script>\s*if\(window\.location\.hash === '#post'\) \{[\s\S]*?\}<\/script>/, '');
  
  fs.writeFileSync('hire/index.html', hireHtml);
  console.log('Modified hire/index.html');
} else {
  console.log('Could not find form');
}
