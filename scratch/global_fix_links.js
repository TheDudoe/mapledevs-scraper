const fs = require('fs');
const path = require('path');

const replacements = {
  '/remote/': '/#mode=Remote',
  '/junior/': '/#exp=junior',
  '/programming/': '/#role=programming',
  '/vancouver/': '/#city=Vancouver',
  '/montreal/': '/#city=Montreal',
  '/toronto/': '/#city=Toronto',
  '/calgary/': '/#city=Calgary',
  '/ottawa/': '/#city=Ottawa',
  '/quebec-city/': '/#city=Quebec%20City',
  '/edmonton/': '/#city=Edmonton',
  '/victoria/': '/#city=Victoria',
  '/london/': '/#city=London',
  '/halifax/': '/#city=Halifax',
  '/kitchener/': '/#city=Kitchener',
  '/burnaby/': '/#city=Burnaby',
  '/art/': '/#role=art',
  '/design/': '/#role=design',
  '/qa/': '/#role=qa',
  '/production/': '/#role=production',
  '/producer/': '/#role=production',
  '/audio/': '/#role=audio',
  '/ui-ux/': '/#role=design',
  '/internship/': '/#type=Internship'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(process.cwd(), (filePath) => {
  if (filePath.endsWith('.html') && !filePath.includes('node_modules')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [oldLink, newLink] of Object.entries(replacements)) {
      const regex = new RegExp(`href="${oldLink}"`, 'g');
      content = content.replace(regex, `href="${newLink}"`);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated links in ${filePath}`);
    }
  }
});

// Also update the role filtering regex in the root index.html to include ui/ux
let rootIndex = fs.readFileSync('index.html', 'utf8');
rootIndex = rootIndex.replace(
  /ro==="design"\?\/design\|level\/i/,
  'ro==="design"?/design|level|ui|ux/i'
);
fs.writeFileSync('index.html', rootIndex);
console.log('Updated design role regex in index.html');
