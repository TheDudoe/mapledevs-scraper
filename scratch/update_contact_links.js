const fs = require('fs');
const path = require('path');

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
    // Replace mailto contact link with the contact page link
    content = content.replace(/href="mailto:mapledevsbusiness@gmail\.com">Contact<\/a>/g, 'href="/contact/">Contact</a>');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated contact link in ${filePath}`);
    }
  }
});
