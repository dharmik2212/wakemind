import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTypingChallenge = async (): Promise<string> => {
  const client = getClient();
  // Fallback phrase if client fails or key is missing
  const fallback = "Rise and Shine";

  if (!client) return fallback;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate exactly 3 random, unrelated, slightly complex English words separated by spaces. Do not use punctuation. Do not use quotes. The output should just be the words.",
      config: {
        maxOutputTokens: 20,
        temperature: 1.0,
      }
    });

    const text = response.text?.trim();
    if (text) {
      // Remove any potential quotes or extra whitespace
      return text.replace(/["'.]/g, '');
    }
    return fallback;
  } catch (error) {
    console.error("Failed to generate challenge:", error);
    return fallback;
  }
};
