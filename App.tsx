
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FlashcardView from './components/FlashcardView';
import AlphabetView from './components/AlphabetView';
import GameView from './components/GameView';
import AIChatView from './components/AIChatView';
import AwardsView from './components/AwardsView';
import DrawingView from './components/DrawingView';
import GardenView from './components/GardenView';
import { AppTab, Sticker } from './types';
import { ALL_STICKERS } from './constants';

const STICKER_KEY = 'explorer_stickers_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CARDS);
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  const [celebration, setCelebration] = useState<{show: boolean, sticker: Sticker | null}>({
    show: false,
    sticker: null
  });

  useEffect(() => {
    // Safety check for API key
    const checkKey = () => {
      try {
        const key = (process.env?.API_KEY) || (window as any).process?.env?.API_KEY;
        if (!key || key === "undefined" || String(key).length < 10) {
          setShowKeyWarning(true);
        } else {
          setShowKeyWarning(false);
        }
      } catch (e) {
        setShowKeyWarning(true);
      }
    };
    
    checkKey();
    const timer = setInterval(checkKey, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleUnlock = (e: any) => {
      const stickerId = e.detail.id;
      const saved = localStorage.getItem(STICKER_KEY);
      const stickers: Sticker[] = saved ? JSON.parse(saved) : ALL_STICKERS;
      
      const stickerIndex = stickers.findIndex(s => s.id === stickerId);
      if (stickerIndex !== -1 && !stickers[stickerIndex].isUnlocked) {
        stickers[stickerIndex].isUnlocked = true;
        localStorage.setItem(STICKER_KEY, JSON.stringify(stickers));
        setCelebration({ show: true, sticker: stickers[stickerIndex] });
      }
    };

    window.addEventListener('unlock-sticker', handleUnlock);
    return () => window.removeEventListener('unlock-sticker', handleUnlock);
  }, []);

  const closeCelebration = () => setCelebration({ show: false, sticker: null });

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.CARDS: return <FlashcardView />;
      case AppTab.ALPHABET: return <AlphabetView />;
      case AppTab.GAME: return <GameView />;
      case AppTab.AI_CHAT: return <AIChatView />;
      case AppTab.AWARDS: return <AwardsView />;
      case AppTab.DRAW: return <DrawingView />;
      case AppTab.GARDEN: return <GardenView />;
      default: return <FlashcardView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {showKeyWarning && (
        <div className="bg-rose-500 text-white p-3 text-[10px] font-black text-center uppercase tracking-tight shadow-xl z-[60] relative border-b-2 border-rose-700 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>MAGIC KEY NOT DETECTED! Set API_KEY in Netlify and Redeploy.</span>
          </div>
        </div>
      )}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
        {renderContent()}
      </div>

      {celebration.show && celebration.sticker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[50px] p-8 flex flex-col items-center gap-6 shadow-2xl border-8 border-orange-400 relative animate-in zoom-in duration-500 max-w-sm w-full">
            <div className="absolute -top-12 text-6xl">🎉</div>
            <h2 className="text-3xl font-black text-orange-600 text-center">New Sticker!</h2>
            <div className="w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center text-[100px] shadow-inner border-4 border-white animate-bounce">
              {celebration.sticker.emoji}
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-800 uppercase">{celebration.sticker.name}</p>
              <p className="text-gray-500 font-bold">You are doing great!</p>
            </div>
            <button 
              onClick={closeCelebration}
              className="w-full bg-orange-500 text-white py-4 rounded-3xl font-black text-xl shadow-[0_6px_0_0_#c2410c] active:shadow-none active:translate-y-[6px] transition-all"
            >
              WOW! THANKS! 🤩
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
