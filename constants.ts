
import { Flashcard, Sticker, BubblesItem } from './types';

export const CATEGORIES = [
  { id: 'animals', name: 'Animals', icon: '🦁', color: 'bg-orange-400' },
  { id: 'body', name: 'Body', icon: '💪', color: 'bg-pink-400' },
  { id: 'home', name: 'Home', icon: '🏠', color: 'bg-blue-400' },
  { id: 'music', name: 'Music', icon: '🎸', color: 'bg-purple-400' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'bg-red-400' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚀', color: 'bg-sky-400' },
  { id: 'nature', name: 'Nature', icon: '🌈', color: 'bg-green-400' },
  { id: 'toys', name: 'Toys', icon: '🧸', color: 'bg-yellow-400' },
  { id: 'food', name: 'Food', icon: '🍕', color: 'bg-amber-400' },
  { id: 'space', name: 'Space', icon: '👩‍🚀', color: 'bg-indigo-400' },
  { id: 'ocean', name: 'Ocean', icon: '🐙', color: 'bg-cyan-400' },
  { id: 'clothes', name: 'Clothes', icon: '👕', color: 'bg-teal-400' },
  { id: 'colors', name: 'Colors', icon: '🎨', color: 'bg-rose-400' },
  { id: 'shapes', name: 'Shapes', icon: '🟦', color: 'bg-slate-400' },
  { id: 'weather', name: 'Weather', icon: '☀️', color: 'bg-yellow-300' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-emerald-400' },
  { id: 'jobs', name: 'Jobs', icon: '👮', color: 'bg-blue-600' },
  { id: 'farm', name: 'Farm', icon: '🚜', color: 'bg-brown-400' },
  { id: 'emotions', name: 'Feelings', icon: '😊', color: 'bg-pink-300' },
  { id: 'school', name: 'School', icon: '🎒', color: 'bg-red-500' },
];

export const BUBBLES_ITEMS: BubblesItem[] = [
  { id: 'item1', name: 'Party Hat', emoji: '🥳', cost: 20 },
  { id: 'item2', name: 'Cool Shades', emoji: '🕶️', cost: 50 },
  { id: 'item3', name: 'Super Cape', emoji: '🦸', cost: 100 },
  { id: 'item4', name: 'Magic Wand', emoji: '🪄', cost: 150 },
  { id: 'item5', name: 'Crown', emoji: '👑', cost: 300 },
  { id: 'item6', name: 'Scarf', emoji: '🧣', cost: 30 },
];

export const ALL_STICKERS: Sticker[] = [
  { id: 's1', name: 'Super Star', emoji: '⭐', isUnlocked: false, requirement: 'First Game Win' },
  { id: 's2', name: 'Dino Friend', emoji: '🦖', isUnlocked: false, requirement: 'Score 50 Points' },
  { id: 's3', name: 'Rocket Learner', emoji: '🚀', isUnlocked: false, requirement: 'Discover 10 Words' },
  { id: 's4', name: 'Wise Bear', emoji: '🧸', isUnlocked: false, requirement: 'Score 100 Points' },
  { id: 's5', name: 'Speaker', emoji: '🎙️', isUnlocked: false, requirement: 'Perfect Pronunciation' },
  { id: 's6', name: 'Stylist', emoji: '👗', isUnlocked: false, requirement: 'Buy first item' },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // Body Parts
  { id: 'b1', word: 'Eye', translation: 'چشم', category: 'body', emoji: '👁️' },
  { id: 'b2', word: 'Ear', translation: 'گوش', category: 'body', emoji: '👂' },
  { id: 'b3', word: 'Nose', translation: 'بینی', category: 'body', emoji: '👃' },
  { id: 'b4', word: 'Mouth', translation: 'دهان', category: 'body', emoji: '👄' },
  { id: 'b5', word: 'Hand', translation: 'دست', category: 'body', emoji: '✋' },
  { id: 'b6', word: 'Foot', translation: 'پا', category: 'body', emoji: '🦶' },
  
  // Home
  { id: 'h1', word: 'Bed', translation: 'تخت خواب', category: 'home', emoji: '🛏️' },
  { id: 'h2', word: 'Chair', translation: 'صندلی', category: 'home', emoji: '🪑' },
  { id: 'h3', word: 'Window', translation: 'پنجره', category: 'home', emoji: '🪟' },
  { id: 'h4', word: 'Door', translation: 'درب', category: 'home', emoji: '🚪' },
  
  // Animals
  { id: 'a1', word: 'Lion', translation: 'شیر', category: 'animals', emoji: '🦁' },
  { id: 'a2', word: 'Elephant', translation: 'فیل', category: 'animals', emoji: '🐘' },
  { id: 'a3', word: 'Monkey', translation: 'میمون', category: 'animals', emoji: '🐒' },
  { id: 'a4', word: 'Zebra', translation: 'گورخر', category: 'animals', emoji: '🦓' },
  
  // Music
  { id: 'm1', word: 'Guitar', translation: 'گیتار', category: 'music', emoji: '🎸' },
  { id: 'm2', word: 'Piano', translation: 'پیانو', category: 'music', emoji: '🎹' },
  { id: 'm3', word: 'Drum', translation: 'طبل', category: 'music', emoji: '🥁' },
  { id: 'm4', word: 'Violin', translation: 'ویولن', category: 'music', emoji: '🎻' },

  // Colors
  { id: 'c1', word: 'Red', translation: 'قرمز', category: 'colors', emoji: '🔴' },
  { id: 'c2', word: 'Blue', translation: 'آبی', category: 'colors', emoji: '🔵' },
  { id: 'c3', word: 'Green', translation: 'سبز', category: 'colors', emoji: '🟢' },
  { id: 'c4', word: 'Yellow', translation: 'زرد', category: '🟡' } as any,
  
  // Fruits
  { id: 'f1', word: 'Apple', translation: 'سیب', category: 'fruits', emoji: '🍎' },
  { id: 'f2', word: 'Banana', translation: 'موز', category: 'fruits', emoji: '🍌' },
  { id: 'f3', word: 'Orange', translation: 'پرتقال', category: 'fruits', emoji: '🍊' },
];
