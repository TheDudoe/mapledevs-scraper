const https = require('https');

const token = 'behaviourinteractive';
const url = `https://boards.greenhouse.io/rss/get?boardToken=${token}`;

https.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('<item>')) {
      console.log('✅ RSS Feed WORKS! Found <item> tags.');
      console.log(data.substring(0, 500));
    } else {
      console.log('❌ RSS Feed failed or empty.');
    }
  });
}).on('error', console.error);
