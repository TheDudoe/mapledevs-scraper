const fs = require('fs');

const t = fs.readFileSync('live.csv', 'utf8');

function parseCSV(t) {
    const rows=[],jobs=[];let r=[],c="",q=false;
    for(let i=0;i<t.length;i++){
        const ch=t[i],nx=t[i+1];
        if(ch==='"'){if(q&&nx==='"'){c+='"';i++;}else{q=!q;}}
        else if(ch===','&&!q){r.push(c);c="";}
        else if(ch==='\n'&&!q){r.push(c);rows.push(r);r=[];c="";}
        else if(ch!=='\r'||q){c+=ch;}
    }
    if(r.length||c){r.push(c);rows.push(r);}
    return rows;
}

const rows = parseCSV(t);
const bad = rows.find(r => r[0] && r[0].includes("creative-fueled"));
if(bad) {
    console.log("BAD ROW:", bad);
} else {
    console.log("No bad row found in test parsing.");
}

const loc = rows.find(r => r[0] && r[0].includes("Location: Vancouver"));
if (loc) {
    console.log("LOC ROW:", loc);
}
