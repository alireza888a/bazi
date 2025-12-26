
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Flashcard } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

const imageCache: Record<string, string> = {};

export const playSpeech = (text: string): void => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
};

export interface ImageResult {
  url: string | null;
  error?: 'QUOTA' | 'ERROR';
}

export const generateCartoonImage = async (prompt: string, id: string): Promise<ImageResult> => {
  if (imageCache[id]) return { url: imageCache[id] };
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const url = `data:image/png;base64,${part.inlineData.data}`;
        imageCache[id] = url;
        return { url };
      }
    }
    return { url: null, error: 'ERROR' };
  } catch (error: any) {
    if (error.message?.includes('429')) return { url: null, error: 'QUOTA' };
    return { url: null, error: 'ERROR' };
  }
};

export const chatWithAI = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: "You are Bubbles, a kind teddy bear. Talk to a 4-year-old learning English. Use very simple words. You can use Farsi only if the child doesn't understand, otherwise stick to English.",
      },
    });
    return response.text || "Hello!";
  } catch (error) {
    return "Let's play!";
  }
};

export const fetchNewWordCurriculum = async (category: string, existingWords: string[]) => {
  try {
    const ai = getAI();
    const prompt = `Give me 10 DIFFERENT and NEW English words for kids in the category: "${category}". 
    IMPORTANT: DO NOT use any of these words: ${existingWords.join(', ')}. 
    Return a JSON array of objects with "word" (English), "translation" (Persian/Farsi meaning), and "emoji".`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              translation: { type: Type.STRING },
              emoji: { type: Type.STRING }
            },
            required: ["word", "translation", "emoji"]
          }
        },
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
