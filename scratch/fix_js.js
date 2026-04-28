const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const correctCode = `  if (window.posthog && typeof window.posthog.capture === 'function') {
    window.posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_title: pageTitle,
      page_path: pagePath
    });
  }
}

window.addEventListener("hashchange", function(e) {
  handleHash();
  applyHash();
  render();
});

window.addEventListener("popstate",function(e){
  if(e.state&&e.state.idx!==undefined) openDet(e.state.idx);
  else if(e.state&&e.state.v==='about') showAbout();
  else if(e.state&&e.state.v==='privacy') showPrivacy();
  else if(e.state&&e.state.v==='terms') showTerms();
  else if(e.state&&e.state.v==='studios') showStudios();
  else if(e.state&&e.state.v==='saved') showSaved();
  else if(e.state&&e.state.v==='studio') openStudioProfile(e.state.n);
  else showBoard();
  trackView();
});

/* ═══════ POST A JOB MODAL ═══════ */`;

html = html.replace(/if \(window\.posthog && typeof window\.posthog\.capture === 'function'\) \{[\s\S]*?\/\* ═══════ POST A JOB MODAL ═══════ \*\//, correctCode);

fs.writeFileSync('index.html', html);
console.log('Fixed js');
