const https = require('https');

const tokens = [
  'digitalextremes', 'behaviour', 'behaviourinteractive', 'bhvr', 
  'klei', 'kleientertainment', 'relic', 'relicentertainment', 
  'phoenixlabs', 'phoenix-labs', 'thunderlotus', 'thunderlotusgames', 
  'tornbanner', 'bigbluebubble', 'inflexion', 'offworld', 'offworldindustries',
  'kabam', 'kabaminc', 'cloudchamber'
];

async function check(token) {
  return new Promise((resolve) => {
    // We try the standard boards-api endpoint
    const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`;
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ FOUND: ${token}`);
      }
      resolve();
    });
    req.on('error', () => resolve());
  });
}

async function run() {
  console.log('🔍 Testing Greenhouse Slug Variations...');
  for (const t of tokens) {
    await check(t);
  }
  console.log('🏁 Done.');
}

run();
