
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_FLASHCARDS, CATEGORIES } from '../constants';
import { Flashcard, GardenPlant } from '../types';
import { playSpeech, generateCartoonImage, fetchNewWordCurriculum } from '../services/geminiService';
import { getImageLocal } from '../services/dbService';

const STORAGE_KEY = 'explorer_dynamic_cards_v3';
const GARDEN_KEY = 'explorer_garden_v1';

const FlashcardView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('animals');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

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

  const filteredCards = useMemo(() => {
    return dynamicCards.filter(c => c.category === activeCategory);
  }, [dynamicCards, activeCategory]);

  const currentCard = filteredCards[currentIndex] || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicCards));
  }, [dynamicCards]);

  // Log to garden when card is viewed
  useEffect(() => {
    if (currentCard) {
      const savedGarden = localStorage.getItem(GARDEN_KEY);
      let garden: GardenPlant[] = savedGarden ? JSON.parse(savedGarden) : [];
      
      if (!garden.some(p => p.wordId === currentCard.id)) {
        const newPlant: GardenPlant = {
          wordId: currentCard.id,
          word: currentCard.word,
          emoji: currentCard.emoji,
          growthLevel: 1,
          lastWatered: Date.now()
        };
        garden.push(newPlant);
        localStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
      }
    }
  }, [currentCard]);

  useEffect(() => {
    const loadImg = async () => {
      if (currentCard && !imageMap[currentCard.id]) {
        const local = await getImageLocal(currentCard.id);
        if (local) {
          setImageMap(prev => ({ ...prev, [currentCard.id]: local }));
        }
      }
    };
    loadImg();
  }, [currentCard, activeCategory, imageMap]);

  const handleNext = (e: any) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = (e: any) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  };

  const handleDiscoverMore = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const existingForCat = dynamicCards.filter(c => c.category === activeCategory).map(c => c.word.toLowerCase());
    const newBatch = await fetchNewWordCurriculum(activeCategory, existingForCat);
    if (newBatch && newBatch.length > 0) {
      const formatted = newBatch.map((b: any, i: number) => ({ ...b, id: `dyn-${Date.now()}-${i}`, category: activeCategory }));
      setDynamicCards(prev => [...prev, ...formatted]);
      playSpeech(`Super! 10 new words added!`);
    }
    setIsGenerating(false);
  };

  const handleDraw = async (e: any) => {
    e.stopPropagation();
    if (!currentCard || loadingIds.has(currentCard.id)) return;
    setLoadingIds(prev => new Set(prev).add(currentCard.id));
    const res = await generateCartoonImage(currentCard.word, currentCard.category, currentCard.id);
    if (res.url) {
      setImageMap(prev => ({ ...prev, [currentCard.id]: res.url! }));
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden">
      
      <div className="w-full shrink-0 pt-4 pb-2">
        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex overflow-x-auto no-scrollbar px-6 gap-5 items-center"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCurrentIndex(0); setIsFlipped(false); }}
              className="flex flex-col items-center justify-center shrink-0"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-md border-4 ${
                activeCategory === cat.id ? 'bg-[#fb923c] border-orange-200 text-white scale-110' : 'bg-white border-transparent text-gray-300'
              }`}>
                {cat.icon}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest mt-1 ${activeCategory === cat.id ? 'text-gray-800' : 'text-gray-300'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 flex flex-col items-center pt-2 pb-8">
        
        <div 
          className="w-full max-w-[320px] aspect-[1/1.1] perspective-1000 relative shrink-0"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            <div className="absolute inset-0 backface-hidden bg-white rounded-[50px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col items-center">
              <div className="flex-1 w-full bg-[#f8fafc] rounded-[35px] flex items-center justify-center overflow-hidden mb-5 relative border border-gray-50 shadow-inner group">
                {imageMap[currentCard?.id || ''] ? (
                  <img 
                    key={currentCard?.id}
                    src={imageMap[currentCard!.id]} 
                    className="w-full h-full object-contain p-4 animate-in fade-in zoom-in duration-500" 
                    alt={currentCard?.word} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-8xl drop-shadow-xl animate-bounce">
                      {currentCard?.emoji}
                    </div>
                    <button 
                      onClick={handleDraw} 
                      className={`px-6 py-3 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 flex items-center gap-2 transition-all ${
                        loadingIds.has(currentCard?.id || '') 
                        ? 'bg-gray-400 text-white cursor-wait' 
                        : 'bg-[#facc15] text-white hover:bg-[#eab308]'
                      }`}
                    >
                      {loadingIds.has(currentCard?.id || '') ? '⏳ MAGIC...' : '🎨 DRAW MAGIC'}
                    </button>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Tap to turn into 3D!</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">{currentCard?.word}</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }}
                  className="w-12 h-12 rounded-[15px] bg-[#e0f2fe] text-[#0ea5e9] flex items-center justify-center text-xl shadow-sm active:scale-90"
                >
                  🔊
                </button>
              </div>
            </div>

            <div className="absolute inset-0 backface-hidden bg-[#6366f1] rounded-[50px] shadow-2xl flex flex-col items-center justify-center p-8 rotate-y-180 text-white text-center">
              <span className="text-7xl farsi-text mb-8 drop-shadow-xl" dir="rtl">{currentCard?.translation}</span>
              <button onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }} className="bg-white/20 px-10 py-4 rounded-2xl font-black text-xl border-2 border-white/30 active:scale-95">🔊 LISTEN</button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[320px] flex gap-3 mt-6">
          <button onClick={handlePrev} className="flex-1 bg-white py-5 rounded-[25px] shadow-md border-b-[6px] border-gray-100 font-black text-gray-400 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 text-[10px] uppercase">
            👈 BACK
          </button>
          <button onClick={handleNext} className="flex-1 bg-white py-5 rounded-[25px] shadow-md border-b-[6px] border-gray-100 font-black text-gray-400 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 text-[10px] uppercase">
            NEXT 👉
          </button>
        </div>

        <button 
          onClick={handleDiscoverMore}
          disabled={isGenerating}
          className={`w-full max-w-[320px] py-5 mt-4 rounded-[25px] font-black text-white shadow-lg border-b-[6px] transition-all text-[11px] tracking-widest ${
            isGenerating ? 'bg-gray-300 border-gray-400' : 'bg-[#22c55e] border-[#16a34a] active:translate-y-1 active:border-b-0'
          }`}
        >
          {isGenerating ? 'FINDING...' : '✨ GET 10 NEW WORDS'}
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;
