
const axios = require('axios');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

listModels();
