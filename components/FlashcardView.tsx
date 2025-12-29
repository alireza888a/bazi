
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_FLASHCARDS, CATEGORIES } from '../constants';
import { Flashcard } from '../types';
import { playSpeech, generateCartoonImage, fetchNewWordCurriculum } from '../services/geminiService';
import { getImageLocal } from '../services/dbService';

const STORAGE_KEY = 'little_explorer_v5_cards';

const FlashcardView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('animals');
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
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationStatus, setPronunciationStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const filteredCards = useMemo(() => {
    return dynamicCards.filter(c => c.category === activeCategory);
  }, [dynamicCards, activeCategory]);

  const currentCard = filteredCards[currentIndex] || null;

  useEffect(() => {
    const loadCurrentCardImage = async () => {
      if (currentCard && !imageMap[currentCard.id]) {
        const local = await getImageLocal(currentCard.id);
        if (local) {
          setImageMap(prev => ({ ...prev, [currentCard.id!]: local }));
        }
      }
    };
    loadCurrentCardImage();
    setPronunciationStatus('idle');
  }, [currentIndex, activeCategory, currentCard]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicCards));
  }, [dynamicCards]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  };

  const handleDiscoverMore = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const allExistingWords = dynamicCards
      .filter(c => c.category === activeCategory)
      .map(c => c.word.toLowerCase());
    
    const newBatch = await fetchNewWordCurriculum(activeCategory, allExistingWords);
    if (newBatch && newBatch.length > 0) {
      const formatted = newBatch.map((b: any, i: number) => ({
        ...b,
        id: `dyn-${Date.now()}-${i}`,
        category: activeCategory
      }));
      setDynamicCards(prev => [...prev, ...formatted]);
      playSpeech(`I found new words!`);
    }
    setIsGenerating(false);
  };

  const handleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript.toLowerCase();
      if (spoken.includes(currentCard?.word.toLowerCase() || '')) {
        setPronunciationStatus('success');
        playSpeech("Excellent!");
      } else {
        setPronunciationStatus('fail');
      }
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
  };

  const handleDrawImage = async () => {
    if (!currentCard || imageMap[currentCard.id] || loadingIds.has(currentCard.id)) return;
    setLoadingIds(prev => new Set(prev).add(currentCard.id));
    const result = await generateCartoonImage(currentCard.word, currentCard.category, currentCard.id);
    if (result.url) setImageMap(prev => ({ ...prev, [currentCard.id]: result.url! }));
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">
      {/* Category Bar - اسکرول افقی روان */}
      <div className="w-full bg-slate-50 border-b border-gray-100 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex flex-nowrap items-center gap-3 px-6 py-4 min-w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCurrentIndex(0); setIsFlipped(false); }}
              className={`flex flex-col items-center justify-center w-14 h-20 rounded-[22px] transition-all shrink-0 ${
                activeCategory === cat.id 
                ? `${cat.color} text-white scale-105 shadow-md` 
                : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-tighter">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Viewport - اسکرول عمودی فعال شد */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 py-6 flex flex-col items-center gap-6">
        
        {/* The Flashcard */}
        <div className="w-full max-w-[300px] aspect-[4/5] perspective-1000 relative shrink-0" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front Side */}
            <div className={`absolute inset-0 backface-hidden bg-white rounded-[40px] border-4 shadow-xl flex flex-col items-center p-5 ${
              pronunciationStatus === 'success' ? 'border-green-400' : 'border-gray-50'
            }`}>
              <div className="w-full flex justify-between mb-3">
                 <div className="bg-sky-50 text-sky-500 px-3 py-1 rounded-full text-[8px] font-black uppercase">
                   {activeCategory}
                 </div>
                 <div className="text-gray-300 text-[10px] font-black">
                   {currentIndex + 1}/{filteredCards.length}
                 </div>
              </div>

              {/* Image Area */}
              <div className="flex-1 w-full flex items-center justify-center bg-slate-50 rounded-[30px] overflow-hidden mb-4 relative border border-gray-100">
                {imageMap[currentCard?.id || ''] ? (
                  <img src={imageMap[currentCard!.id]} className="w-full h-full object-contain" alt={currentCard?.word} />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    {loadingIds.has(currentCard?.id || '') ? (
                      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDrawImage(); }} 
                        className="bg-yellow-400 text-white px-5 py-3 rounded-2xl font-black text-[10px] shadow-md active:scale-95"
                      >
                        🎨 MAGIC DRAW
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Word & Sound */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black uppercase text-gray-800 tracking-tight">{currentCard?.word}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }} 
                  className="w-10 h-10 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center text-lg active:scale-90 shadow-sm"
                >
                  🔊
                </button>
              </div>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-[40px] shadow-xl flex flex-col items-center justify-center p-6 rotate-y-180 text-white text-center">
              <span className="text-5xl mb-6 farsi-text leading-tight" dir="rtl">{currentCard?.translation}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }}
                className="bg-white/20 px-8 py-3 rounded-2xl font-black text-lg hover:bg-white/30 active:scale-95"
              >
                🔊 LISTEN
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls - این بخش الان با اسکرول کردن قابل دیدن است */}
        <div className="w-full max-w-[300px] flex flex-col gap-3 pb-10">
          <div className="flex items-center gap-3 w-full">
            <button onClick={handlePrev} className="bg-white w-12 h-12 rounded-xl shadow-md border-b-4 border-gray-100 flex items-center justify-center text-lg active:translate-y-1 active:border-b-0">👈</button>
            <button 
              onClick={handleSpeech}
              className={`flex-1 h-12 rounded-xl font-black text-white shadow-lg border-b-4 flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-xs ${
                isRecording ? 'bg-red-500 border-red-700 animate-pulse' : 'bg-yellow-400 border-yellow-600'
              }`}
            >
              {isRecording ? 'LISTENING...' : '🎙️ SAY IT!'}
            </button>
            <button onClick={handleNext} className="bg-white w-12 h-12 rounded-xl shadow-md border-b-4 border-gray-100 flex items-center justify-center text-lg active:translate-y-1 active:border-b-0">👉</button>
          </div>

          <button 
            onClick={handleDiscoverMore}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-lg border-b-4 text-[10px] active:translate-y-1 active:border-b-0 transition-all ${
              isGenerating ? 'bg-gray-300 border-gray-400' : 'bg-green-500 border-green-700'
            }`}
          >
            {isGenerating ? 'FINDING...' : '✨ GET 10 NEW WORDS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
