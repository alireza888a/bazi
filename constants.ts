
import { Flashcard, Sticker, BubblesItem } from './types';

export const CATEGORIES = [
  { id: 'animals', name: 'Animals', icon: '🦁', color: 'bg-orange-400' },
  { id: 'actions', name: 'Actions', icon: '🏃', color: 'bg-yellow-500' },
  { id: 'opposites', name: 'Opposites', icon: '⚖️', color: 'bg-indigo-500' },
  { id: 'body', name: 'Body', icon: '💪', color: 'bg-pink-400' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'bg-red-400' },
  { id: 'home', name: 'Home', icon: '🏠', color: 'bg-blue-400' },
  { id: 'daily', name: 'My Day', icon: '☀️', color: 'bg-emerald-500' },
  { id: 'insects', name: 'Bugs', icon: '🦋', color: 'bg-lime-400' },
  { id: 'positions', name: 'Where?', icon: '📦', color: 'bg-violet-400' },
  { id: 'music', name: 'Music', icon: '🎸', color: 'bg-purple-400' },
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
  { id: 'farm', name: 'Farm', icon: '🚜', color: 'bg-orange-800' },
  { id: 'emotions', name: 'Feelings', icon: '😊', color: 'bg-pink-300' },
  { id: 'school', name: 'School', icon: '🎒', color: 'bg-red-500' },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // 1. Animals
  { id: 'a1', word: 'Lion', translation: 'شیر', category: 'animals', emoji: '🦁' },
  { id: 'a2', word: 'Elephant', translation: 'فیل', category: 'animals', emoji: '🐘' },
  { id: 'a3', word: 'Monkey', translation: 'میمون', category: 'animals', emoji: '🐒' },
  { id: 'a4', word: 'Dog', translation: 'سگ', category: 'animals', emoji: '🐶' },
  { id: 'a5', word: 'Rabbit', translation: 'خرگوش', category: 'animals', emoji: '🐰' },
  { id: 'a6', word: 'Cat', translation: 'گربه', category: 'animals', emoji: '🐱' },
  { id: 'a7', word: 'Giraffe', translation: 'زرافه', category: 'animals', emoji: '🦒' },

  // 2. Actions
  { id: 'ac1', word: 'Run', translation: 'دویدن', category: 'actions', emoji: '🏃' },
  { id: 'ac2', word: 'Jump', translation: 'پریدن', category: 'actions', emoji: '🦘' },
  { id: 'ac3', word: 'Sleep', translation: 'خوابیدن', category: 'actions', emoji: '😴' },
  { id: 'ac4', word: 'Eat', translation: 'خوردن', category: 'actions', emoji: '😋' },
  { id: 'ac5', word: 'Dance', translation: 'رقصیدن', category: 'actions', emoji: '💃' },
  { id: 'ac6', word: 'Walk', translation: 'راه رفتن', category: 'actions', emoji: '🚶' },
  { id: 'ac7', word: 'Swim', translation: 'شنا کردن', category: 'actions', emoji: '🏊' },

  // 3. Opposites
  { id: 'op1', word: 'Big', translation: 'بزرگ', category: 'opposites', emoji: '🐘' },
  { id: 'op2', word: 'Small', translation: 'کوچک', category: 'opposites', emoji: '🐭' },
  { id: 'op3', word: 'Hot', translation: 'داغ', category: 'opposites', emoji: '🔥' },
  { id: 'op4', word: 'Cold', translation: 'سرد', category: 'opposites', emoji: '❄️' },
  { id: 'op5', word: 'Fast', translation: 'سریع', category: 'opposites', emoji: '🏎️' },
  { id: 'op6', word: 'Slow', translation: 'آهسته', category: 'opposites', emoji: '🐢' },
  { id: 'op7', word: 'Up', translation: 'بالا', category: 'opposites', emoji: '⬆️' },
  { id: 'op8', word: 'Down', translation: 'پایین', category: 'opposites', emoji: '⬇️' },

  // 4. Daily Routine
  { id: 'dr1', word: 'Brush', translation: 'مسواک زدن', category: 'daily', emoji: '🪥' },
  { id: 'dr2', word: 'Wash', translation: 'شستن', category: 'daily', emoji: '🧼' },
  { id: 'dr3', word: 'Drink', translation: 'نوشیدن', category: 'daily', emoji: '🥤' },
  { id: 'dr4', word: 'Read', translation: 'خواندن', category: 'daily', emoji: '📚' },
  { id: 'dr5', word: 'Play', translation: 'بازی کردن', category: 'daily', emoji: '🧸' },
  { id: 'dr6', word: 'Wake up', translation: 'بیدار شدن', category: 'daily', emoji: '⏰' },

  // 5. Insects
  { id: 'in1', word: 'Bee', translation: 'زنبور', category: 'insects', emoji: '🐝' },
  { id: 'in2', word: 'Butterfly', translation: 'پروانه', category: 'insects', emoji: '🦋' },
  { id: 'in3', word: 'Ant', translation: 'مورچه', category: 'insects', emoji: '🐜' },
  { id: 'in4', word: 'Spider', translation: 'عنکبوت', category: 'insects', emoji: '🕷️' },
  { id: 'in5', word: 'Ladybug', translation: 'کفشدوزک', category: 'insects', emoji: '🐞' },

  // 6. Positions
  { id: 'po1', word: 'In', translation: 'داخل', category: 'positions', emoji: '📥' },
  { id: 'po2', word: 'On', translation: 'رویِ', category: 'positions', emoji: '🔝' },
  { id: 'po3', word: 'Under', translation: 'زیرِ', category: 'positions', emoji: '👇' },
  { id: 'po4', word: 'Behind', translation: 'پشتِ', category: 'positions', emoji: '🔙' },
  { id: 'po5', word: 'Next to', translation: 'کنارِ', category: 'positions', emoji: '➡️' },

  // More variety
  { id: 'b1', word: 'Eye', translation: 'چشم', category: 'body', emoji: '👁️' },
  { id: 'b2', word: 'Ear', translation: 'گوش', category: 'body', emoji: '👂' },
  { id: 'b3', word: 'Nose', translation: 'بینی', category: 'body', emoji: '👃' },
  { id: 'b4', word: 'Mouth', translation: 'دهان', category: 'body', emoji: '👄' },
  { id: 'b5', word: 'Hand', translation: 'دست', category: 'body', emoji: '✋' },
  { id: 'f1', word: 'Apple', translation: 'سیب', category: 'fruits', emoji: '🍎' },
  { id: 'f2', word: 'Banana', translation: 'موز', category: 'fruits', emoji: '🍌' },
  { id: 'co1', word: 'Red', translation: 'قرمز', category: 'colors', emoji: '🔴' },
  { id: 'co2', word: 'Blue', translation: 'آبی', category: 'colors', emoji: '🔵' },
  { id: 'co3', word: 'Green', translation: 'سبز', category: 'colors', emoji: '🟢' },
  { id: 'sh1', word: 'Circle', translation: 'دایره', category: 'shapes', emoji: '⭕' },
  { id: 'sh2', word: 'Square', translation: 'مربع', category: 'shapes', emoji: '🟦' },
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
