const https = require('https');

const studios = [
  { name: 'Behaviour', variations: ['behaviour', 'behaviourinteractive', 'bhvr', 'bhvren', 'behaviour-interactive'] },
  { name: 'Relic', variations: ['relic', 'relicentertainment', 'relic-entertainment'] },
  { name: 'Phoenix Labs', variations: ['phoenixlabs', 'phoenix-labs', 'phl'] },
  { name: 'Klei', variations: ['klei', 'kleientertainment', 'klei-entertainment'] },
  { name: 'Thunder Lotus', variations: ['thunderlotus', 'thunder-lotus', 'thunderlotusgames'] },
  { name: 'Torn Banner', variations: ['tornbanner', 'torn-banner', 'tornbannerstudios'] },
  { name: 'Kabam', variations: ['kabam', 'kabaminc', 'kabam-games'] },
  { name: 'Offworld', variations: ['offworld', 'offworldindustries', 'offworld-industries'] }
];

async function check(token) {
  return new Promise((resolve) => {
    const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`;
    https.get(url, (res) => {
      if (res.statusCode === 200) resolve(true);
      else resolve(false);
    }).on('error', () => resolve(false));
  });
}

async function run() {
  console.log('🔍 Deep Search for Greenhouse Slugs...');
  for (const studio of studios) {
    console.log(`Checking ${studio.name}...`);
    for (const v of studio.variations) {
      if (await check(v)) {
        console.log(`  ✅ MATCH FOUND: ${v}`);
        break;
      }
    }
  }
}

run();
