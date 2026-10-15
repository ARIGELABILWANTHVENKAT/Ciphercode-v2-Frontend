require('dotenv').config();
const apiKey = process.env.AI_API_KEY;

async function listModels() {
  console.log("⏳ Fetching available models for your API key...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("\n❌ API Error:", data.error.message);
      console.log("This usually means your API key is invalid or the 'Generative Language API' is not enabled in your Google Cloud Console.");
      return;
    }
    
    console.log("\n✅ Your API key has access to these models:\n");
    data.models.forEach(m => {
      // Check if the model supports the generateContent method
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`👉 ${m.name.replace('models/', '')}`);
      }
    });
    console.log("\n📋 Copy one of the model names above (without 'models/') and paste it here!");
  } catch (e) {
    console.error("❌ Network Error:", e.message);
  }
}

listModels();