import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMockProduct = async (userPrompt: string): Promise<Partial<Product>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a creative, high-quality AI prompt product based on this user idea: "${userPrompt}". 
      Return the result as a JSON object suitable for an e-commerce card. 
      The 'promptSnippet' should be the actual prompt text someone would buy. 
      Make it sound professional and catchy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            promptSnippet: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            price: { type: Type.NUMBER },
          },
          required: ["title", "description", "promptSnippet", "tags", "price"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback if API fails or key is missing
    return {
      title: "AI Generated Concept",
      description: "A futuristic concept generated based on your input.",
      promptSnippet: `Imagine a ${userPrompt} in a high-fidelity style...`,
      tags: ["AI", "Generated", "Creative"],
      price: 4.99
    };
  }
};