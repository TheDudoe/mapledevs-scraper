const fs = require('fs');
const COL = {title:0,studio:1,location:2,type:3,mode:4,desc:5,apply:6,posted:7,featured:8,student:9,salary:10,engine:11,visa:12};

function parseCSV(t) {
  const rows = [], jobs = [];
  let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i], nx = t[i+1];
    if (ch === '"') {
      if (q && nx === '"') { c += '"'; i++; }
      else { q = !q; }
    } else if (ch === ',' && !q) {
      r.push(c); c = "";
    } else if (ch === '\n' && !q) {
      r.push(c); rows.push(r); r = []; c = "";
    } else if (ch !== '\r' || q) {
      c += ch;
    }
  }
  if (r.length || c) { r.push(c); rows.push(r); }
  
  for (let i = 1; i < rows.length; i++) {
    const rw = rows[i];
    if (!rw || !rw[COL.title] || !rw[COL.studio]) continue;
    jobs.push({
      title: cl(rw[COL.title]),
      studio: cl(rw[COL.studio]),
      location: cl(rw[COL.location]),
      type: rw[COL.type] ? cl(rw[COL.type]) : "",
      mode: rw[COL.mode] ? cl(rw[COL.mode]) : "",
      desc: rw[COL.desc] ? cl(rw[COL.desc]) : "",
      apply: rw[COL.apply] ? cl(rw[COL.apply]) : "",
      posted: rw[COL.posted] ? cl(rw[COL.posted]) : "",
      featured: rw[COL.featured] ? cl(rw[COL.featured]||"").toLowerCase() === "yes" : false,
      student: rw[COL.student] ? cl(rw[COL.student]||"").toLowerCase() === "yes" : false,
      salary: rw[COL.salary] ? cl(rw[COL.salary]) : "",
      engine: rw[COL.engine] ? cl(rw[COL.engine]) : "",
      visa: rw[COL.visa] ? cl(rw[COL.visa]) : ""
    });
  }
  return jobs;
}
function cl(s) { return s ? s.trim() : ""; }

const t = fs.readFileSync('C:\\\\Users\\\\wupei\\\\.gemini\\\\antigravity\\\\brain\\\\208842fc-995c-4d89-be83-b4b07e92e1c1\\\\.system_generated\\\\steps\\\\36\\\\content.md', 'utf8');
const lines = t.split('\n');
const csv = lines.slice(4).join('\n'); // skip markdown header
const res = jobs.filter(j => j.title.includes('Software Engineer (Unreal Engine 5)'));
console.log(JSON.stringify(res, null, 2));
