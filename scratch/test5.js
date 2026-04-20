
const fs = require('fs');
const t = fs.readFileSync('live.csv', 'utf8');
const COL={title:0,studio:1,location:2,type:3,mode:4,desc:5,apply:6,posted:7,featured:8,student:9,salary:10,engine:11,visa:12};
function cl(s){return s?s.trim():"";}
function parseCSV(t){const rows=[],jobs=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i],nx=t[i+1];if(ch==='"'){if(q&&nx==='"'){c+='"';i++;}else{q=!q;}}else if(ch===','&&!q){r.push(c);c="";}else if(ch==='\n'&&!q){r.push(c);rows.push(r);r=[];c="";}else if(ch!=='\r'||q){c+=ch;}}if(r.length||c){r.push(c);rows.push(r);}for(let i=1;i<rows.length;i++){const rw=rows[i];if(!rw||!rw[COL.title]||!rw[COL.studio])continue;jobs.push({title:cl(rw[COL.title]),studio:cl(rw[COL.studio]),location:cl(rw[COL.location]),type:cl(rw[COL.type]),mode:cl(rw[COL.mode]),desc:cl(rw[COL.desc]),apply:cl(rw[COL.apply]),posted:cl(rw[COL.posted]),featured:cl(rw[COL.featured]||"").toLowerCase()==="yes",student:cl(rw[COL.student]||"").toLowerCase()==="yes",salary:cl(rw[COL.salary]),engine:cl(rw[COL.engine]),visa:cl(rw[COL.visa])});}return jobs;}

const jobs = parseCSV(t);
const bad = jobs.filter(j => j.title && (j.title.includes('Location: Vancouver') || j.title.includes('creative-fueled')));
console.log('Bad jobs from index.html parseCSV:', bad.length);
if (bad.length > 0) {
    console.log(bad);
}
