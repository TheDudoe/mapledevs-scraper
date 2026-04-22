
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  try {
    // There is no easy ListModels in the JS SDK without a lot of setup
    // But we can try a dummy model to see the error message's suggestion
    const model = genAI.getGenerativeModel({ model: "dummy" });
    await model.generateContent("hi");
  } catch (e) {
    console.error(e.message);
  }
}

run();
