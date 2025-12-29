
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { getImageLocal, saveImageLocal } from "./dbService";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Memory cache for current session speed
const memoryImageCache: Record<string, string> = {};

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
  error?: 'QUOTA' | 'SAFETY' | 'ERROR';
}

export const generateCartoonImage = async (word: string, category: string, id: string): Promise<ImageResult> => {
  // 1. Check memory cache (fastest)
  if (memoryImageCache[id]) return { url: memoryImageCache[id] };

  // 2. Check IndexedDB (Permanent storage on phone)
  try {
    const localData = await getImageLocal(id);
    if (localData) {
      memoryImageCache[id] = localData;
      return { url: localData };
    }
  } catch (e) {
    console.warn("Local DB access failed, proceeding to API");
  }

  // 3. If not found, call API
  try {
    const ai = getAI();
    
    let prompt = `A high-quality 3D cartoon style illustration of a ${word} for a children's learning app. Very bright and vibrant colors, happy and friendly look, clear shapes, studio lighting, isolated on a pure white background.`;
    
    if (category === 'body') {
      prompt = `A friendly 3D cartoon illustration of a human ${word}. Educational and clear. Focus ONLY on the human ${word}. NO animals (no giraffes), NO full body, NO clothing. Pure white background, vibrant colors.`;
      
      if (word.toLowerCase() === 'neck') {
        prompt = "A clear 3D cartoon illustration of a human neck. Simple, educational, happy colors. ONLY human neck, NO animals, NO giraffe. Isolated on white background.";
      }
      if (word.toLowerCase() === 'stomach') {
        prompt = "A cute 3D cartoon illustration of a human stomach/belly area. Friendly for kids. NO pregnancy, NO food, just the human midsection. Isolated on white background.";
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1"
        } 
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const url = `data:image/png;base64,${part.inlineData.data}`;
        
        // Save to memory cache
        memoryImageCache[id] = url;
        
        // 4. Save to IndexedDB for permanent access
        try {
          await saveImageLocal(id, url);
        } catch (e) {
          console.error("Failed to save to local DB", e);
        }

        return { url };
      }
    }
    return { url: null, error: 'ERROR' };
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    if (error.message?.includes('429')) return { url: null, error: 'QUOTA' };
    if (error.message?.includes('safety')) return { url: null, error: 'SAFETY' };
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
    // Improved prompt with explicit exclusion list
    const prompt = `Give me 10 UNIQUE and NEW English words for kids in the category: "${category}". 
    IMPORTANT: You MUST NOT return any of these words: ${existingWords.join(', ')}. 
    Choose simple words suitable for 4-6 year olds. 
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
