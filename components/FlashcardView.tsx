
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_FLASHCARDS, CATEGORIES } from '../constants';
import { Flashcard } from '../types';
import { playSpeech, generateCartoonImage, fetchNewWordCurriculum } from '../services/geminiService';

const STORAGE_KEY = 'little_explorer_v5_cards';

const FlashcardView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('body');
  const [dynamicCards, setDynamicCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const initialIds = new Set(INITIAL_FLASHCARDS.map(c => c.id));
        return [...INITIAL_FLASHCARDS, ...parsed.filter((c: any) => !initialIds.has(c.id))];
      } catch (e) { return INITIAL_FLASHCARDS; }
    }
    return INITIAL_FLASHCARDS;
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<'NONE' | 'SUCCESS' | 'TRY_AGAIN'>('NONE');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mouse Wheel to Horizontal Scroll for Desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicCards));
  }, [dynamicCards]);

  const filteredCards = useMemo(() => {
    return dynamicCards.filter(c => c.category === activeCategory);
  }, [dynamicCards, activeCategory]);

  const currentCard = filteredCards[currentIndex] || null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < filteredCards.length - 1 ? prev + 1 : 0));
    setFeedback('NONE');
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredCards.length - 1));
    setFeedback('NONE');
  };

  const handleDiscoverMore = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const existingInCat = filteredCards.map(c => c.word.toLowerCase());
    const oldLength = filteredCards.length;
    
    const newBatch = await fetchNewWordCurriculum(activeCategory, existingInCat);
    if (newBatch && newBatch.length > 0) {
      const formatted = newBatch.map((b: any, i: number) => ({
        ...b,
        id: `dyn-${Date.now()}-${i}`,
        category: activeCategory
      }));
      setDynamicCards(prev => [...prev, ...formatted]);
      setCurrentIndex(oldLength);
      playSpeech(`Wow! 10 more words!`);
      window.dispatchEvent(new CustomEvent('unlock-sticker', { detail: { id: 's3' } }));
    }
    setIsGenerating(false);
  };

  const handleDrawImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard || imageMap[currentCard.id] || loadingIds.has(currentCard.id)) return;
    setLoadingIds(prev => new Set(prev).add(currentCard.id));
    
    let customPrompt = `A cute simple 3D cartoon style illustration of ${currentCard.word} for toddlers, bright colors, high quality, white background.`;
    if (currentCard.word.toLowerCase() === 'wrist') {
      customPrompt = "3D cartoon illustration of a human wrist, clear view, no watch, no sleeves, kids education style, white background.";
    }
      
    const result = await generateCartoonImage(customPrompt, currentCard.id);
    if (result.url) {
      setImageMap(prev => ({ ...prev, [currentCard.id]: result.url! }));
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      {/* 20 CATEGORIES */}
      <div className="w-full bg-white/60 backdrop-blur-md border-b border-gray-100 overflow-hidden flex-shrink-0">
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar w-full">
          <div className="category-scroll-wrapper gap-3 py-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setCurrentIndex(0); setIsFlipped(false); }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-[30px] transition-all border-b-4 active:translate-y-1 ${
                  activeCategory === cat.id 
                  ? `${cat.color} text-white border-black/5 shadow-lg scale-105` 
                  : 'bg-white text-gray-400 border-gray-50'
                }`}
              >
                <span className="text-3xl mb-1">{cat.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{cat.name}</span>
              </button>
            ))}
            <div className="flex-shrink-0 w-4 h-1"></div>
          </div>
        </div>
      </div>

      {/* Responsive Flip Card */}
      <div 
        className="w-[min(340px,90vw)] aspect-[3/4.2] perspective-1000 relative mt-6 select-none" 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front: English */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[50px] border-[8px] border-sky-50 shadow-xl flex flex-col items-center justify-between p-6">
            <div className="text-[10px] font-black text-sky-500 bg-sky-50 px-5 py-1.5 rounded-full uppercase tracking-widest">
              {activeCategory} • {currentIndex + 1}/{filteredCards.length}
            </div>

            <div className="flex-1 flex items-center justify-center w-full my-4 overflow-hidden">
              {imageMap[currentCard?.id || ''] ? (
                <img src={imageMap[currentCard!.id]} className="w-full h-full object-contain rounded-2xl animate-in zoom-in" alt={currentCard?.word} />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className={`text-[120px] drop-shadow-xl ${loadingIds.has(currentCard?.id || '') ? 'animate-pulse' : ''}`}>
                    {currentCard?.emoji}
                  </div>
                  {!loadingIds.has(currentCard?.id || '') && (
                    <button onClick={handleDrawImage} className="text-[10px] font-black text-white bg-sky-400 px-6 py-2.5 rounded-full border-b-4 border-sky-600 shadow-md active:translate-y-1 active:border-b-0 transition-all">
                      ✨ MAGIC PICTURE
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-gray-800 uppercase tracking-tighter">{currentCard?.word}</span>
                <button onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }} className="text-3xl active:scale-125 transition-transform bg-gray-50 p-2 rounded-full">🔊</button>
              </div>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Tap to flip</p>
            </div>
          </div>

          {/* Back: Persian (Farsi) */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[50px] border-[8px] border-white/20 shadow-xl flex flex-col items-center justify-center p-6 rotate-y-180 text-white">
            <span className="text-7xl mb-4 drop-shadow-2xl opacity-90">⭐</span>
            <span className="text-6xl font-black mb-8 farsi-text text-white drop-shadow-md" dir="rtl">
              {currentCard?.translation}
            </span>
            <div className="h-1.5 w-20 bg-white/30 rounded-full mb-8"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }}
              className="bg-white text-indigo-600 px-10 py-4 rounded-full font-black text-2xl shadow-xl flex items-center gap-4 active:scale-95 transition-all"
            >
              <span>🔊</span> LISTEN
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-[min(340px,90vw)] mt-6 px-2">
        <button onClick={handlePrev} className="bg-white w-16 h-16 rounded-[25px] shadow-lg border-b-4 border-gray-100 flex items-center justify-center text-3xl kid-button-press">
          👈
        </button>
        <button className="flex-1 h-16 rounded-[25px] font-black text-xl text-white shadow-xl border-b-4 bg-yellow-400 border-yellow-600 kid-button-press">
          🎙️ SAY IT!
        </button>
        <button onClick={handleNext} className="bg-white w-16 h-16 rounded-[25px] shadow-lg border-b-4 border-gray-100 flex items-center justify-center text-3xl kid-button-press">
          👉
        </button>
      </div>

      <button 
        onClick={handleDiscoverMore}
        disabled={isGenerating}
        className={`w-[min(340px,90vw)] py-5 rounded-[35px] font-black text-xl text-white transition-all flex items-center justify-center gap-4 shadow-xl border-b-4 mt-6 ${
          isGenerating ? 'bg-gray-400 border-gray-500' : 'bg-green-500 border-green-700 kid-button-press'
        }`}
      >
        {isGenerating ? <span className="animate-spin text-2xl">🌀</span> : '✨ GET 10 NEW WORDS'}
      </button>
    </div>
  );
};

export default FlashcardView;
