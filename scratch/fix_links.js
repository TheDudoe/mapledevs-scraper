const fs = require('fs');
const path = require('path');

const folders = [
  'vancouver', 'toronto', 'montreal', 'ottawa', 'quebec-city', 'edmonton', 
  'calgary', 'victoria', 'london', 'halifax', 'kitchener', 'burnaby',
  'programming', 'art', 'design', 'producer', 'qa', 'audio', 'ui-ux',
  'junior', 'remote', 'internship'
];

folders.forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Deleted ' + f);
  }
});

let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const replacements = {
  '/remote/': '/#mode=Remote',
  '/junior/': '/#exp=junior',
  '/programming/': '/#role=programming',
  '/vancouver/': '/#city=Vancouver',
  '/montreal/': '/#city=Montreal',
  '/toronto/': '/#city=Toronto',
  '/calgary/': '/#city=Calgary',
  '/art/': '/#role=art',
  '/design/': '/#role=design',
  '/qa/': '/#role=qa',
  '/production/': '/#role=production',
  '/producer/': '/#role=production',
  '/audio/': '/#role=audio',
  '/internship/': '/#type=Internship'
};

for (const [oldLink, newLink] of Object.entries(replacements)) {
  const regex = new RegExp(`href="${oldLink}"`, 'g');
  indexHtml = indexHtml.replace(regex, `href="${newLink}"`);
}

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml);
console.log('Updated index.html links');

// Also update build-seo.js so it stops generating these
let buildSeo = fs.readFileSync(path.join(__dirname, '..', 'build-seo.js'), 'utf8');
// remove the SEO_TARGETS array items for cities and roles
buildSeo = buildSeo.replace(/const SEO_TARGETS = \[[\s\S]*?\];/, `const SEO_TARGETS = [
    { folder: 'about', hash: '#about', title: 'About MapleDevs | Canada\\'s Game Industry Job Board', desc: 'Why we built MapleDevs and how we are helping Canadian game developers find local opportunities.' },
    { folder: 'studios', hash: '#studios', title: 'Top Canadian Game Studios Hiring Now | MapleDevs', desc: 'Browse the directory of Canadian game studios currently hiring. Vancouver, Montreal, Toronto and more.' },
    { folder: 'saved', hash: '#saved', title: 'Your Saved Jobs | MapleDevs', desc: 'Manage your bookmarked game industry opportunities in Canada.' }
];`);
fs.writeFileSync(path.join(__dirname, '..', 'build-seo.js'), buildSeo);
console.log('Updated build-seo.js');
