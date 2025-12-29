
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { getImageLocal, saveImageLocal } from "./dbService";

const getApiKey = () => {
  try {
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                (window as any).process?.env?.API_KEY;
    return key?.trim();
  } catch (e) {
    return undefined;
  }
};

export const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

const memoryImageCache: Record<string, string> = {};

// --- Audio Utilities ---
export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playSpeech = (text: string): void => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
};

// --- Magic Drawing ---
export const transformSketchToCartoon = async (base64Image: string): Promise<{url: string, word: string} | null> => {
  try {
    const ai = getAI();
    // Step 1: Analyze and transform image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png'
            }
          },
          {
            text: "This is a child's simple drawing. First, tell me what this is in ONE word (e.g., 'Cat', 'Sun'). Then, generate a high-quality 3D Pixar-style cartoon version of this exact object on a plain white background. Return both the name and the image."
          }
        ]
      }
    });

    let word = "Magic!";
    let imageUrl = "";

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) {
        // Extract first word from response text if it exists
        const match = part.text.match(/[A-Za-z]+/);
        if (match) word = match[0];
      }
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    if (imageUrl) return { url: imageUrl, word };
    return null;
  } catch (error) {
    console.error("Magic drawing error:", error);
    return null;
  }
};

export const generateCartoonImage = async (word: string, category: string, id: string): Promise<{url: string | null}> => {
  if (memoryImageCache[id]) return { url: memoryImageCache[id] };
  try {
    const localData = await getImageLocal(id);
    if (localData) {
      memoryImageCache[id] = localData;
      return { url: localData };
    }
  } catch (e) {}

  try {
    const ai = getAI();
    let prompt = `A high-quality 3D cartoon style illustration of a "${word}" for a children's learning app. Very bright and vibrant colors, happy and friendly look, isolated on a pure white background. Pixar style.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      const url = `data:image/png;base64,${part.inlineData.data}`;
      memoryImageCache[id] = url;
      await saveImageLocal(id, url);
      return { url };
    }
    return { url: null };
  } catch (error) {
    return { url: null };
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
  } catch (error) {
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
  } catch (error) { return []; }
};
