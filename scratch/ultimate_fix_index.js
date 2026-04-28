const fs = require('fs');

const studiosPath = 'studios/index.html';
const indexPath = 'index.html';

const studiosContent = fs.readFileSync(studiosPath, 'utf8');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Extract the main script from studios/index.html
const mainScriptMarker = 'const SHEET_DOC_ID =';
const scriptStart = studiosContent.lastIndexOf('<script>', studiosContent.indexOf(mainScriptMarker));
const scriptEnd = studiosContent.indexOf('</script>', scriptStart) + 9;
let mainScript = studiosContent.substring(scriptStart, scriptEnd);

// Replace the old openDet with the new one
const oldOpenDet = /function openDet\(idx,e\)\{history\.pushState\(\{idx\},"","#job-"\+idx\);[\s\S]*?trackView\(j\.title \+ ' \| MapleDevs'\);}/;
const newOpenDet = `function openDet(idx, e) {
  if(e) e.preventDefault();
  if(window.innerWidth >= 900) {
    const pane = document.getElementById('inline-detail-pane');
    if(pane) {
      const j = ALL[idx];
      const headerDiv = document.createElement('div');
      headerDiv.className = 'detail-header';
      headerDiv.innerHTML = \`
        <div class="d-title">\${esc(j.title)}</div>
        <div class="d-studio">\${esc(j.studio)}</div>
        <a href="\${esc(j.apply)}" target="_blank" rel="noopener" class="detail-apply-btn" onclick="trackApply(event)">Apply Now</a>
      \`;
      const contentDiv = document.createElement('div');
      contentDiv.className = 'detail-scroll-content';
      contentDiv.innerHTML = detailHTML(j, idx);
      pane.innerHTML = '';
      pane.appendChild(headerDiv);
      pane.appendChild(contentDiv);
      document.querySelectorAll('.jc').forEach(c => c.classList.remove('active'));
      const card = document.querySelector(\`.jc[onclick*="openDet(\${idx},"]\`) || e?.currentTarget;
      if(card) card.classList.add('active');
      return;
    }
  }
  history.pushState({idx},"","#job-"+idx);
  const j=ALL[idx];
  hideAll();
  document.getElementById("detail-view").classList.add("on");
  document.body.classList.add('detail-actions-open');
  document.getElementById("d-crumbs").innerHTML='<button onclick="showBoard()">Jobs</button>'+(j.location?'<span class="sep">›</span><button onclick="filterCity(\\' '+esc(j.location)+' \\')">'+esc(j.location)+'</button>':'')+'<span class="sep">›</span><span class="cur">'+esc(j.title)+'</span>';
  document.getElementById("d-content").innerHTML=detailHTML(j,idx);
  window.scrollTo(0,0);
  trackView(j.title + ' | MapleDevs');
}`;

mainScript = mainScript.replace(oldOpenDet, newOpenDet);

// Find where the footer ends in the current index.html
const footerEndMarker = '</footer>';
const footerEndIndex = indexContent.indexOf(footerEndMarker) + 10;

const headerAndBody = indexContent.substring(0, footerEndIndex);

// Find the feature banner and closing tags (they are at the end)
const bannerMarker = '<!-- Sticky Feature Banner -->';
const bannerIndex = indexContent.lastIndexOf(bannerMarker);
const bannerAndClosing = indexContent.substring(bannerIndex);

const finalContent = headerAndBody + '\n' + mainScript + '\n\n' + bannerAndClosing;

fs.writeFileSync(indexPath, finalContent);
console.log('Index.html restored and updated perfectly.');
