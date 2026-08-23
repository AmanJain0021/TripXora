const { GoogleGenAI, Type, Schema } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateStructuredOutput = async (prompt, schema, model = 'gemini-2.5-flash') => {
  try {
    if (process.env.GEMINI_API_KEY === 'mocked_key_for_now' || !process.env.GEMINI_API_KEY) {
      console.warn('Using mocked Gemini API key. Returning empty object.');
      return {};
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.2, // Low temp for more deterministic parsing
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI content');
  }
};

module.exports = {
  generateStructuredOutput,
  Type // export Type for schema definitions
};
