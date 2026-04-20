const fs = require('fs');
const t = fs.readFileSync('live.csv', 'utf8');

function parseCSV(t){
  const rows=[];let r=[],c='',q=false;
  for(let i=0;i<t.length;i++){
    const ch=t[i],nx=t[i+1];
    if(ch==='"'){if(q&&nx==='"'){c+='"';i++;}else{q=!q;}}
    else if(ch===','&&!q){r.push(c);c='';}
    else if(ch==='\n'&&!q){r.push(c);rows.push(r);r=[];c='';}
    else if(ch!=='\r'||q){c+=ch;}
  }
  if(r.length||c){r.push(c);rows.push(r);}
  return rows;
}

const rows = parseCSV(t);
const COL = {title:0, studio:1, location:2, type:3, mode:4, desc:5, engine:11, visa:12};

console.log('Total jobs:', rows.length - 1);
for(let i=1; i<6; i++) {
    const rw = rows[i];
    if(!rw) continue;
    console.log(`\n[${i}] ${rw[COL.title]} at ${rw[COL.studio]}`);
    console.log(`Engine: ${rw[COL.engine] || '(empty)'} | Visa: ${rw[COL.visa] || '(empty)'}`);
    console.log(`Desc: ${rw[COL.desc] ? rw[COL.desc].substring(0, 200) : '(empty)'}`);
}
