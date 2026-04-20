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
const sr = rows.filter(r => r.join(',').includes('Unreal Engine 5)'));
console.log(sr);
