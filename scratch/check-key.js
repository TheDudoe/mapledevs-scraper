
require('dotenv').config();
console.log("Key Starts With:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 4) : "NONE");
