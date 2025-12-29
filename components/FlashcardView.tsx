
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const [errorStatus, setErrorStatus] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationStatus, setPronunciationStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const loadCurrentCardImage = async () => {
      const currentCard = filteredCards[currentIndex];
      if (currentCard && !imageMap[currentCard.id]) {
        const local = await getImageLocal(currentCard.id);
        if (local) {
          setImageMap(prev => ({ ...prev, [currentCard.id]: local }));
        }
      }
    };
    loadCurrentCardImage();
    setPronunciationStatus('idle'); // Reset status when moving
  }, [currentIndex, activeCategory]);

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
    
    const oldLength = filteredCards.length;
    const newBatch = await fetchNewWordCurriculum(activeCategory, allExistingWords);
    
    if (newBatch && newBatch.length > 0) {
      const uniqueNewBatch = newBatch.filter((newItem: any) => 
        !allExistingWords.includes(newItem.word.toLowerCase())
      );

      if (uniqueNewBatch.length > 0) {
        const formatted = uniqueNewBatch.map((b: any, i: number) => ({
          ...b,
          id: `dyn-${Date.now()}-${i}`,
          category: activeCategory
        }));
        setDynamicCards(prev => [...prev, ...formatted]);
        setCurrentIndex(oldLength);
        playSpeech(`Wow! ${uniqueNewBatch.length} new words!`);
        window.dispatchEvent(new CustomEvent('unlock-sticker', { detail: { id: 's3' } }));
      }
    }
    setIsGenerating(false);
  };

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Oops! Your phone doesn't support voice recognition. Try Chrome or Safari!");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);
    setPronunciationStatus('idle');

    recognition.start();

    recognition.onresult = (event: any) => {
      const spokenWord = event.results[0][0].transcript.toLowerCase().trim();
      const targetWord = currentCard?.word.toLowerCase().trim();

      if (spokenWord === targetWord || spokenWord.includes(targetWord || '')) {
        setPronunciationStatus('success');
        playSpeech("Perfect! Well done!");
        window.dispatchEvent(new CustomEvent('unlock-sticker', { detail: { id: 's5' } }));
        window.dispatchEvent(new CustomEvent('add-stars', { detail: { count: 10 } }));
      } else {
        setPronunciationStatus('fail');
        playSpeech(`I heard ${spokenWord}. Let's try again!`);
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setPronunciationStatus('fail');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const handleDrawImage = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard || imageMap[currentCard.id] || loadingIds.has(currentCard.id)) return;
    
    setLoadingIds(prev => new Set(prev).add(currentCard.id));
    setErrorStatus(prev => {
      const next = {...prev};
      delete next[currentCard.id];
      return next;
    });
    
    const result = await generateCartoonImage(currentCard.word, currentCard.category, currentCard.id);
    
    if (result.url) {
      setImageMap(prev => ({ ...prev, [currentCard.id]: result.url! }));
    } else if (result.error) {
      setErrorStatus(prev => ({ ...prev, [currentCard.id]: result.error! }));
    }
    
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden pt-1 px-4">
      {/* CATEGORIES */}
      <div className="w-full bg-white/40 backdrop-blur-md border-b border-gray-200/50 overflow-hidden flex-shrink-0 mb-2">
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar w-full">
          <div className="category-scroll-wrapper gap-2 py-2 px-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setCurrentIndex(0); setIsFlipped(false); }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-[20px] transition-all border-b-4 active:translate-y-1 ${
                  activeCategory === cat.id 
                  ? `${cat.color} text-white border-black/5 shadow-md scale-105` 
                  : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                <span className="text-xl mb-0.5">{cat.icon}</span>
                <span className="text-[7px] font-black uppercase tracking-tighter">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard Card */}
      <div 
        className="w-full max-w-[320px] h-[45vh] min-h-[320px] perspective-1000 relative select-none" 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          <div className={`absolute inset-0 backface-hidden bg-white rounded-[35px] border-4 transition-colors duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col items-center justify-between p-4 ${
            pronunciationStatus === 'success' ? 'border-green-400 bg-green-50/30' : 
            pronunciationStatus === 'fail' ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'
          }`}>
            <div className="text-[8px] font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase flex items-center gap-1">
              {activeCategory} • {currentIndex + 1}/{filteredCards.length}
              {pronunciationStatus === 'success' && <span className="text-green-500 ml-1">✅</span>}
            </div>

            <div className="flex-1 flex items-center justify-center w-full my-2 overflow-hidden bg-gray-50/50 rounded-2xl relative">
              {imageMap[currentCard?.id || ''] ? (
                <img src={imageMap[currentCard!.id]} className="w-full h-full object-contain rounded-2xl animate-in zoom-in duration-500" alt={currentCard?.word} />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  {loadingIds.has(currentCard?.id || '') ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                      <p className="text-[9px] font-black text-yellow-600 animate-pulse uppercase">Magic in progress...</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-8xl drop-shadow-md opacity-25 grayscale">{currentCard?.emoji}</div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDrawImage(); }} 
                        className="bg-yellow-400 text-white px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg border-b-4 border-yellow-600 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2"
                      >
                        🎨 MAGIC CARTOON
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black uppercase tracking-tight transition-colors ${
                  pronunciationStatus === 'success' ? 'text-green-600' : 'text-gray-800'
                }`}>{currentCard?.word}</span>
                <button onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }} className="text-xl active:scale-125 transition-transform bg-gray-50 p-1 rounded-full shadow-sm">🔊</button>
              </div>
              <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">Tap for Persian</p>
            </div>
          </div>

          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[35px] border-4 border-white/10 shadow-xl flex flex-col items-center justify-center p-4 rotate-y-180 text-white">
            <span className="text-5xl mb-1 drop-shadow-xl opacity-80">⭐</span>
            <span className="text-4xl font-black mb-4 farsi-text text-white drop-shadow-md" dir="rtl">
              {currentCard?.translation}
            </span>
            <div className="h-0.5 w-12 bg-white/20 rounded-full mb-4"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); playSpeech(currentCard!.word); }}
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-2xl font-black text-lg shadow-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <span>🔊</span> LISTEN
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 w-full max-w-[320px] mt-3">
        <button onClick={handlePrev} className="bg-white w-12 h-12 rounded-[18px] shadow-sm border border-gray-100 flex items-center justify-center text-xl kid-button-press">
          👈
        </button>
        <button 
          onClick={handleSpeech}
          disabled={isRecording}
          className={`flex-1 h-12 rounded-[18px] font-black text-base text-white shadow-md border-b-4 transition-all flex items-center justify-center gap-2 ${
            isRecording 
              ? 'bg-rose-500 border-rose-700 animate-pulse' 
              : pronunciationStatus === 'success'
                ? 'bg-green-500 border-green-700'
                : 'bg-yellow-400 border-yellow-600 kid-button-press'
          }`}
        >
          {isRecording ? '🎧 LISTENING...' : pronunciationStatus === 'success' ? '🌟 AWESOME!' : '🎙️ SAY IT!'}
        </button>
        <button onClick={handleNext} className="bg-white w-12 h-12 rounded-[18px] shadow-sm border border-gray-100 flex items-center justify-center text-xl kid-button-press">
          👉
        </button>
      </div>

      <button 
        onClick={handleDiscoverMore}
        disabled={isGenerating}
        className={`w-full max-w-[320px] py-3.5 rounded-[22px] font-black text-base text-white transition-all flex items-center justify-center gap-2 shadow-sm border-b-4 mt-3 ${
          isGenerating ? 'bg-gray-400 border-gray-500' : 'bg-green-500 border-green-700 kid-button-press'
        }`}
      >
        {isGenerating ? <span className="animate-spin text-lg">🌀</span> : '✨ GET 10 NEW WORDS'}
      </button>
    </div>
  );
};

export default FlashcardView;
