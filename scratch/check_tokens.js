const https = require('https');

const tokens = [
  'behaviour', 'behaviourinteractive', 'relic', 'relicentertainment', 
  'phoenixlabs', 'phoenix-labs', 'offworld', 'offworldindustries', 
  'kabam', 'klei', 'thunderlotus', 'tornbanner', 'bigbluebubble',
  'inflexiongames', 'cloudchamber'
];

async function check(token) {
  return new Promise((resolve) => {
    const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`;
    https.get(url, (res) => {
      console.log(`${token.padEnd(20)}: ${res.statusCode === 200 ? '✅ 200' : '❌ ' + res.statusCode}`);
      resolve();
    }).on('error', () => {
      console.log(`${token.padEnd(20)}: ❌ ERROR`);
      resolve();
    });
  });
}

async function run() {
  console.log('🔍 Checking Greenhouse Tokens...');
  for (const t of tokens) {
    await check(t);
  }
}

run();
