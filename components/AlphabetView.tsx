
import React, { useState } from 'react';
import { playSpeech } from '../services/geminiService';

const ALPHABET_DATA = [
  { char: 'A', word: 'Apple', emoji: '🍎', color: 'bg-red-400' },
  { char: 'B', word: 'Ball', emoji: '⚽', color: 'bg-blue-400' },
  { char: 'C', word: 'Cat', emoji: '🐱', color: 'bg-orange-400' },
  { char: 'D', word: 'Dog', emoji: '🐶', color: 'bg-green-400' },
  { char: 'E', word: 'Elephant', emoji: '🐘', color: 'bg-purple-400' },
  { char: 'F', word: 'Fish', emoji: '🐟', color: 'bg-cyan-400' },
  { char: 'G', word: 'Giraffe', emoji: '🦒', color: 'bg-yellow-400' },
  { char: 'H', word: 'Horse', emoji: '🐴', color: 'bg-amber-400' },
  { char: 'I', word: 'Igloo', emoji: '🏠', color: 'bg-indigo-400' },
  { char: 'J', word: 'Juice', emoji: '🧃', color: 'bg-pink-400' },
  { char: 'K', word: 'Kite', emoji: '🪁', color: 'bg-rose-400' },
  { char: 'L', word: 'Lion', emoji: '🦁', color: 'bg-orange-500' },
  { char: 'M', word: 'Monkey', emoji: '🐒', color: 'bg-yellow-600' },
  { char: 'N', word: 'Nose', emoji: '👃', color: 'bg-pink-300' },
  { char: 'O', word: 'Orange', emoji: '🍊', color: 'bg-orange-300' },
  { char: 'P', word: 'Plane', emoji: '✈️', color: 'bg-sky-400' },
  { char: 'Q', word: 'Queen', emoji: '👸', color: 'bg-purple-300' },
  { char: 'R', word: 'Rabbit', emoji: '🐰', color: 'bg-gray-400' },
  { char: 'S', word: 'Sun', emoji: '☀️', color: 'bg-yellow-200' },
  { char: 'T', word: 'Tiger', emoji: '🐯', color: 'bg-orange-600' },
  { char: 'U', word: 'Umbrella', emoji: '☂️', color: 'bg-blue-300' },
  { char: 'V', word: 'Van', emoji: '🚐', color: 'bg-slate-400' },
  { char: 'W', word: 'Whale', emoji: '🐋', color: 'bg-blue-500' },
  { char: 'X', word: 'Xylophone', emoji: '🎹', color: 'bg-red-300' },
  { char: 'Y', word: 'Yo-yo', emoji: '🪀', color: 'bg-emerald-400' },
  { char: 'Z', word: 'Zebra', emoji: '🦓', color: 'bg-zinc-400' },
];

const AlphabetView: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleLetterTap = (item: typeof ALPHABET_DATA[0]) => {
    setSelectedLetter(item.char);
    // اصلاح شده: حالا فقط نام خود حرف پخش می‌شود (مثل A, B, C...)
    playSpeech(item.char);
    setTimeout(() => setSelectedLetter(null), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden p-4">
      <div className="bg-purple-500 p-6 rounded-[35px] text-center mb-4 shadow-lg border-b-8 border-purple-700">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">ALPHABET BOOK 📖</h2>
        <p className="text-white/80 font-bold text-[8px] tracking-[0.2em] uppercase mt-1">Tap a letter to hear its sound</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="grid grid-cols-3 gap-3">
          {ALPHABET_DATA.map((item) => (
            <button
              key={item.char}
              onClick={() => handleLetterTap(item)}
              className={`aspect-square rounded-[30px] flex flex-col items-center justify-center relative transition-all duration-300 active:scale-95 shadow-md border-b-[6px] ${
                selectedLetter === item.char 
                ? 'bg-white border-purple-500 scale-105' 
                : `${item.color} border-black/10`
              }`}
            >
              {selectedLetter === item.char ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <span className="text-4xl mb-1">{item.emoji}</span>
                  <span className="text-xs font-black text-gray-800 uppercase">{item.word}</span>
                </div>
              ) : (
                <span className="text-5xl font-black text-white drop-shadow-md">{item.char}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlphabetView;
