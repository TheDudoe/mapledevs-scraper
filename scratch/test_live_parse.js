const fs = require('fs');

async function testFetchAndParse() {
    const fetch = (...args) => import('node-fetch').then(({default: _fetch}) => _fetch(...args)).catch(() => globalThis.fetch(...args));
    
    console.log("Fetching live data...");
    const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSkt2ROoihRVsL4f0m4dXZ1IzD7KYzEghgOwW7QPC2EN6sE4D_iI3stfllfdeq61coOrhdi47eeLmoY/pub?output=csv");
    const t = await res.text();
    fs.writeFileSync('live.csv', t);
    
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
        
        const cl = (s) => s ? s.trim() : "";
        for(let i=1;i<rows.length;i++){
            const rw=rows[i];
            if(!rw||!rw[0]||!rw[1])continue;
            jobs.push({ 
                title: cl(rw[0]), 
                studio: cl(rw[1])
            });
        }
        return jobs;
    }
    
    const jobs = parseCSV(t);
    console.log("Total jobs:", jobs.length);
    console.log("Bad jobs:");
    jobs.filter(j => j.title.includes('Location:') || j.title.includes('fueled') || j.title.includes('BC')).forEach(j => {
        console.log(j);
    });
}
testFetchAndParse().catch(console.error);
