
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { getImageLocal, saveImageLocal } from "./dbService";

const getAI = () => {
  // این بخش از متغیر محیطی که شما در نتلیفای ست کردید استفاده می‌کند
  const apiKey = process.env.API_KEY?.trim();
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("⚠️ API_KEY is missing! Make sure it's set correctly in Netlify.");
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

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
  error?: 'QUOTA' | 'SAFETY' | 'ERROR' | 'KEY';
}

export const generateCartoonImage = async (word: string, category: string, id: string): Promise<ImageResult> => {
  if (memoryImageCache[id]) return { url: memoryImageCache[id] };

  try {
    const localData = await getImageLocal(id);
    if (localData) {
      memoryImageCache[id] = localData;
      return { url: localData };
    }
  } catch (e) {
    console.warn("Local DB access failed");
  }

  try {
    const ai = getAI();
    
    let prompt = `A high-quality 3D cartoon style illustration of a "${word}" for a children's learning app. Very bright and vibrant colors, happy and friendly look, isolated on a pure white background. Pixar style.`;
    
    if (category === 'body') {
      prompt = `A friendly 3D cartoon illustration of a human ${word} for kids. Isolated on white.`;
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

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const url = `data:image/png;base64,${part.inlineData.data}`;
          memoryImageCache[id] = url;
          try {
            await saveImageLocal(id, url);
          } catch (e) {}
          return { url };
        }
      }
    }
    return { url: null, error: 'ERROR' };
  } catch (error: any) {
    console.error("Image Error:", error);
    if (error.message === "MISSING_API_KEY") return { url: null, error: 'KEY' };
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
        systemInstruction: "You are Bubbles, a magical teddy bear friend for kids. Use very simple English, emojis, and be super encouraging!",
      },
    });
    return response.text || "Hello! Let's learn!";
  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") return "Please add my magic key in settings!";
    return "I'm a little sleepy, let's talk soon! 💤";
  }
};

export const fetchNewWordCurriculum = async (category: string, existingWords: string[]) => {
  try {
    const ai = getAI();
    const prompt = `Give me 10 NEW English words for kids in category "${category}". Skip: ${existingWords.join(', ')}. Return JSON.`;

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
    return [];
  }
};
