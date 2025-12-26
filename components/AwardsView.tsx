
import React, { useState, useEffect } from 'react';
import { ALL_STICKERS } from '../constants';
import { Sticker } from '../types';

const STICKER_KEY = 'explorer_stickers_v1';

const AwardsView: React.FC = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STICKER_KEY);
    if (saved) {
      setStickers(JSON.parse(saved));
    } else {
      setStickers(ALL_STICKERS);
      localStorage.setItem(STICKER_KEY, JSON.stringify(ALL_STICKERS));
    }
  }, []);

  const unlockedCount = stickers.filter(s => s.isUnlocked).length;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="bg-orange-100 p-6 rounded-[40px] border-4 border-orange-200 text-center shadow-inner">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="text-2xl font-black text-orange-700">My Sticker Book</h2>
        <p className="text-orange-600 font-bold">You have {unlockedCount} / {stickers.length} stickers!</p>
        
        <div className="mt-4 w-full h-4 bg-white rounded-full overflow-hidden border-2 border-orange-200">
          <div 
            className="h-full bg-orange-400 transition-all duration-1000" 
            style={{ width: `${(unlockedCount / stickers.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stickers.map((sticker) => (
          <div 
            key={sticker.id}
            className={`
              aspect-square rounded-[30px] flex flex-col items-center justify-center gap-1 border-4 transition-all
              ${sticker.isUnlocked 
                ? 'bg-white border-orange-300 shadow-md scale-100' 
                : 'bg-gray-100 border-gray-200 opacity-40 grayscale scale-90'}
            `}
          >
            <span className="text-4xl">{sticker.emoji}</span>
            <span className={`text-[9px] font-black text-center px-1 uppercase ${sticker.isUnlocked ? 'text-orange-600' : 'text-gray-400'}`}>
              {sticker.isUnlocked ? sticker.name : '???'}
            </span>
            {!sticker.isUnlocked && (
              <span className="text-[7px] text-gray-400 font-bold px-2 text-center leading-tight">
                {sticker.requirement}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-sky-50 p-4 rounded-3xl border-2 border-dashed border-sky-200 mt-4">
        <p className="text-center text-sky-700 font-bold text-sm">
          💡 Play games and find new words to unlock more stickers!
        </p>
      </div>
    </div>
  );
};

export default AwardsView;
