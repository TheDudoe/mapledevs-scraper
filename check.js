const https = require('https');
const url = 'https://docs.google.com/spreadsheets/d/1L2KcTO32jK5MVY1m3qdqdja7LTZ38f8lYXsK5mNMMDo/gviz/tq?tqx=out:csv&sheet=ALL';

https.get(url, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    let q=false, c='', r=[], rows=[];
    for(let i=0; i<data.length; i++){
      let ch=data[i], nx=data[i+1];
      if(ch==='"'){
        if(q && nx==='"'){ c+='"'; i++; }
        else { q=!q; }
      } else if(ch===',' && !q){
        r.push(c); c='';
      } else if(ch==='\n' && !q){
        r.push(c); rows.push(r); r=[]; c='';
      } else if(ch!=='\r' || q){
        c+=ch;
      }
    }
    if(r.length||c){r.push(c);rows.push(r);}
    
    console.log('Row 29 title: ' + rows[29][0]);
    console.log('Row 29 feature (col 8): ' + rows[29][8]);
    console.log('Row 29 status (col 16): ' + rows[29][16]);
    console.log('Row 29 link_status (col 18): ' + rows[29][18]);
    
    console.log('Row 30 title: ' + rows[30][0]);
    console.log('Row 30 feature (col 8): ' + rows[30][8]);
    console.log('Row 30 status (col 16): ' + rows[30][16]);
    console.log('Row 30 link_status (col 18): ' + rows[30][18]);
  });
});
