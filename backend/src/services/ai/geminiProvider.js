const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateStructuredOutput = async (prompt, schema, model = 'gemini-2.5-flash', retries = 3) => {
  if (process.env.GEMINI_API_KEY === 'mocked_key_for_now' || !process.env.GEMINI_API_KEY) {
    console.warn('Using mocked Gemini API key. Returning empty object.');
    return {};
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2, // Low temp for more deterministic parsing
        },
      });

      if (!response || !response.text) {
        throw new Error('Empty response text from Gemini API');
      }

      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;
      const errorMsg = error?.cause?.message || error?.message || String(error);
      console.error(`Gemini API Error (Attempt ${attempt}/${retries}):`, errorMsg);

      if (attempt < retries) {
        const backoffMs = attempt * 1500;
        console.log(`Retrying Gemini request in ${backoffMs}ms...`);
        await delay(backoffMs);
      }
    }
  }

  console.error('All Gemini API retries failed:', lastError);
  throw new Error(`Failed to generate AI content after ${retries} attempts: ${lastError?.message || lastError}`);
};

module.exports = {
  generateStructuredOutput,
  Type // export Type for schema definitions
};

