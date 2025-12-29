
export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  category: string;
  emoji: string;
  imageUrl?: string;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  isUnlocked: boolean;
  requirement: string;
}

export interface BubblesItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

export interface UserStats {
  stars: number;
  unlockedItems: string[]; // IDs of items owned
  equippedItem: string | null; // ID of currently worn item
}

export interface GameState {
  score: number;
  currentQuestion: Flashcard | null;
  options: Flashcard[];
  isCorrect: boolean | null;
}

export enum AppTab {
  CARDS = 'cards',
  GAME = 'game',
  AI_CHAT = 'ai_chat',
  AWARDS = 'awards',
  ALPHABET = 'alphabet',
  DRAW = 'draw',
  GARDEN = 'garden'
}

export interface GardenPlant {
  wordId: string;
  word: string;
  emoji: string;
  growthLevel: number; // 1 to 4
  lastWatered: number;
}
