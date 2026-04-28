const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('.list-col { flex: 1; min-width: 0; }', '.list-col { flex: 4; min-width: 0; }');
html = html.replace('width: 45%;', 'width: 55%; flex: 5.5;');

const extraCSS = `
.detail-col .d-hdr {
  position: sticky;
  top: -1px;
  background: var(--bg-card);
  z-index: 10;
  padding-top: 24px;
  margin-top: -24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.pill { justify-content: center; text-align: center; }
`;
html = html.replace('</style>', extraCSS + '\n</style>');

fs.writeFileSync('index.html', html);
console.log('Fixed styles');
