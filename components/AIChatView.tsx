
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI, playSpeech } from '../services/geminiService';
import { BUBBLES_ITEMS } from '../constants';
import { UserStats, BubblesItem } from '../types';

const STATS_KEY = 'little_explorer_stats_v1';

const AIChatView: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    return saved ? JSON.parse(saved) : { stars: 0, unlockedItems: [], equippedItem: null };
  });

  const [messages, setMessages] = useState([{ text: "Hi! I'm Bubbles! 🐻 What's your name?", sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [showWardrobe, setShowWardrobe] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showWardrobe]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInput('');
    const response = await chatWithAI(text);
    setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    playSpeech(response);
  };

  const buyItem = (item: BubblesItem) => {
    if (stats.stars >= item.cost && !stats.unlockedItems.includes(item.id)) {
      setStats(prev => ({
        ...prev,
        stars: prev.stars - item.cost,
        unlockedItems: [...prev.unlockedItems, item.id],
        equippedItem: item.id
      }));
      playSpeech(`I love the ${item.name}!`);
      window.dispatchEvent(new CustomEvent('unlock-sticker', { detail: { id: 's6' } }));
    } else if (stats.unlockedItems.includes(item.id)) {
      setStats(prev => ({ ...prev, equippedItem: prev.equippedItem === item.id ? null : item.id }));
    }
  };

  const equippedEmoji = BUBBLES_ITEMS.find(i => i.id === stats.equippedItem)?.emoji || '';

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] max-h-full">
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl mb-4 border border-green-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="text-3xl bg-white w-12 h-12 rounded-full flex items-center justify-center border-2 border-green-400">🐻</div>
            {equippedEmoji && <div className="absolute -top-1 -right-1 text-2xl animate-bounce">{equippedEmoji}</div>}
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-lg">Bubbles</h3>
            <p className="text-[10px] text-green-600 font-bold">{stats.stars} ⭐</p>
          </div>
        </div>
        <button 
          onClick={() => setShowWardrobe(!showWardrobe)}
          className={`px-4 py-1.5 rounded-xl font-bold text-[10px] transition-all ${showWardrobe ? 'bg-pink-400 text-white' : 'bg-white text-pink-400 border-2 border-pink-100'}`}
        >
          {showWardrobe ? 'CHAT 💬' : 'CLOSET 👗'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 p-1 mb-4 no-scrollbar">
        {!showWardrobe ? (
          messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] p-4 rounded-[25px] font-bold text-base shadow-sm ${m.sender === 'user' ? 'self-end bg-sky-400 text-white rounded-tr-none' : 'self-start bg-white border-2 border-sky-50 text-gray-800 rounded-tl-none'}`}>
              {m.text}
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {BUBBLES_ITEMS.map(item => {
              const owned = stats.unlockedItems.includes(item.id);
              const equipped = stats.equippedItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => buyItem(item)}
                  className={`p-3 rounded-2xl border-4 flex flex-col items-center gap-1 transition-all ${equipped ? 'border-green-400 bg-green-50' : owned ? 'border-pink-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-80'}`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[9px] font-black uppercase">{item.name}</span>
                  {!owned && <span className="text-[10px] font-bold text-yellow-600">{item.cost} ⭐</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!showWardrobe && (
        <div className="flex gap-2 flex-shrink-0 bg-white p-2 border-t border-gray-50">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Talk to me..." 
            className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-sky-300" 
          />
          <button onClick={() => handleSend(input)} className="bg-sky-400 text-white px-5 rounded-xl font-black shadow-md">🚀</button>
        </div>
      )}
    </div>
  );
};

export default AIChatView;
