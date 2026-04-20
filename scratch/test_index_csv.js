const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const match = indexHtml.match(/function parseCSV\(t\)\{.*?\}/)[0];

console.log("Length:", match.length);
console.log("Snippet:", match.substring(0, 150));
console.log("Snippet end:", match.substring(match.length - 150));
