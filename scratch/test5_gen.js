const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// extract parseCSV from index.html (till the final closing brace of the function)
// Due to minification, find the block.
const startIndex = html.indexOf('function parseCSV(t)');
const endIndex = html.indexOf('return jobs;}') + 'return jobs;}'.length;
const fnStr = html.substring(startIndex, endIndex);

const colMatch = "const COL={title:0,studio:1,location:2,type:3,mode:4,desc:5,apply:6,posted:7,featured:8,student:9,salary:10,engine:11,visa:12};";

const scriptCode = `
const fs = require('fs');
const t = fs.readFileSync('live.csv', 'utf8');
${colMatch}
function cl(s){return s?s.trim():"";}
${fnStr}

const jobs = parseCSV(t);
const bad = jobs.filter(j => j.title && (j.title.includes('Location: Vancouver') || j.title.includes('creative-fueled')));
console.log('Bad jobs from index.html parseCSV:', bad.length);
if (bad.length > 0) {
    console.log(bad);
}
`;

fs.writeFileSync('scratch/test5.js', scriptCode);
