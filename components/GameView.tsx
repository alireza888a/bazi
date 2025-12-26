
import React, { useState, useEffect } from 'react';
import { INITIAL_FLASHCARDS, CATEGORIES } from '../constants';
import { Flashcard } from '../types';
import { playSpeech } from '../services/geminiService';

enum GameType {
  MENU = 'menu',
  WORD_TO_EMOJI = 'word_to_emoji',
  FARSI_TO_EMOJI = 'farsi_to_emoji',
  SOUND_TO_EMOJI = 'sound_to_emoji',
  MEMORY = 'memory',
  ODD_ONE_OUT = 'odd_one_out',
  SORTING = 'sorting',
  LETTER_POP = 'letter_pop'
}

const GameView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.MENU);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<{ target: any; options: any[]; extra?: any } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [memoryCards, setMemoryCards] = useState<{id: string, emoji: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  
  // Letter Pop specific state
  const [spellingProgress, setSpellingProgress] = useState<number>(0);
  const [scrambledLetters, setScrambledLetters] = useState<{char: string, id: number, popped: boolean, delay: number}[]>([]);

  const playFeedback = (success: boolean) => {
    if (success) {
      playSpeech("Great job!");
      window.dispatchEvent(new CustomEvent('add-stars', { detail: { count: 10 } }));
      setScore(s => s + 10);
      if (score === 0) window.dispatchEvent(new CustomEvent('unlock-sticker', { detail: { id: 's1' } }));
    } else {
      playSpeech("Try again!");
    }
  };

  const generateNewRound = (type: GameType) => {
    setIsCorrect(null);
    const shuffled = [...INITIAL_FLASHCARDS].sort(() => 0.5 - Math.random());
    
    switch (type) {
      case GameType.WORD_TO_EMOJI:
      case GameType.FARSI_TO_EMOJI:
      case GameType.SOUND_TO_EMOJI:
        const target = shuffled[0];
        const options = shuffled.slice(0, 4).sort(() => 0.5 - Math.random());
        setQuestion({ target, options });
        if (type === GameType.SOUND_TO_EMOJI) playSpeech(target.word);
        break;

      case GameType.ODD_ONE_OUT:
        const validCats = CATEGORIES.filter(cat => 
          INITIAL_FLASHCARDS.filter(c => c.category === cat.id).length >= 3
        );
        if (validCats.length < 2) {
          setActiveGame(GameType.MENU);
          return;
        }
        const cat1 = validCats[Math.floor(Math.random() * validCats.length)].id;
        let cat2 = validCats[Math.floor(Math.random() * validCats.length)].id;
        while (cat2 === cat1) cat2 = validCats[Math.floor(Math.random() * validCats.length)].id;
        const mainItems = INITIAL_FLASHCARDS.filter(c => c.category === cat1).sort(() => 0.5 - Math.random()).slice(0, 3);
        const oddItem = INITIAL_FLASHCARDS.filter(c => c.category === cat2).sort(() => 0.5 - Math.random())[0];
        setQuestion({ target: oddItem, options: [...mainItems, oddItem].sort(() => 0.5 - Math.random()) });
        break;

      case GameType.SORTING:
        const sValidCats = CATEGORIES.filter(cat => INITIAL_FLASHCARDS.some(c => c.category === cat.id));
        const sortCat1 = sValidCats[Math.floor(Math.random() * sValidCats.length)];
        let sortCat2 = sValidCats[Math.floor(Math.random() * sValidCats.length)];
        while (sortCat2.id === sortCat1.id) sortCat2 = sValidCats[Math.floor(Math.random() * sValidCats.length)];
        
        const possibleItems = INITIAL_FLASHCARDS.filter(c => c.category === sortCat1.id || c.category === sortCat2.id);
        const currentItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        
        setQuestion({ target: currentItem, options: [sortCat1, sortCat2] });
        break;

      case GameType.LETTER_POP:
        const wordTarget = shuffled[0];
        const letters = wordTarget.word.toUpperCase().split('');
        const scrambled = letters
          .map((char, i) => ({ 
            char, 
            id: i, 
            popped: false,
            delay: Math.random() * 2 // Random delay for float animation offset
          }))
          .sort(() => 0.5 - Math.random());
        setScrambledLetters(scrambled);
        setSpellingProgress(0);
        setQuestion({ target: wordTarget, options: [] });
        break;

      case GameType.MEMORY:
        const pairs = shuffled.slice(0, 3);
        const cards = [...pairs, ...pairs]
          .sort(() => 0.5 - Math.random())
          .map((c, i) => ({ id: `${c.id}-${i}`, emoji: c.emoji, isFlipped: false, isMatched: false }));
        setMemoryCards(cards);
        setFlippedIndices([]);
        break;
    }
  };

  useEffect(() => {
    if (activeGame !== GameType.MENU) generateNewRound(activeGame);
  }, [activeGame]);

  const handleChoice = (option: any) => {
    if (isCorrect !== null) return;
    let win = false;
    if (activeGame === GameType.SORTING) {
      win = question?.target.category === option.id;
    } else {
      win = option.id === question?.target.id;
    }
    setIsCorrect(win);
    playFeedback(win);
    setTimeout(() => {
      if (win) generateNewRound(activeGame);
      else setIsCorrect(null);
    }, 1200);
  };

  const handleLetterTap = (letterObj: any) => {
    if (letterObj.popped || !question) return;
    
    const targetWord = question.target.word.toUpperCase();
    const nextCharNeeded = targetWord[spellingProgress];

    if (letterObj.char === nextCharNeeded) {
      playSpeech(letterObj.char);
      const newScrambled = scrambledLetters.map(l => 
        l.id === letterObj.id ? { ...l, popped: true } : l
      );
      setScrambledLetters(newScrambled);
      setSpellingProgress(p => p + 1);

      if (spellingProgress + 1 === targetWord.length) {
        playFeedback(true);
        playSpeech(question.target.word);
        setTimeout(() => generateNewRound(GameType.LETTER_POP), 2000);
      }
    } else {
      playSpeech("Oops!");
      setIsCorrect(false);
      setTimeout(() => setIsCorrect(null), 500);
    }
  };

  const handleMemoryClick = (index: number) => {
    if (flippedIndices.length === 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) return;
    const newCards = [...memoryCards];
    newCards[index].isFlipped = true;
    setMemoryCards(newCards);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setMemoryCards(matchedCards);
          setFlippedIndices([]);
          playFeedback(true);
          if (matchedCards.every(c => c.isMatched)) setTimeout(() => generateNewRound(GameType.MEMORY), 1000);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setMemoryCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (activeGame === GameType.MENU) {
    return (
      <div className="flex flex-col gap-3 p-4 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-8 rounded-[40px] text-center shadow-xl mb-2">
          <h2 className="text-4xl font-black text-white mb-1">GAMES 🎮</h2>
          <p className="text-white/80 font-bold uppercase tracking-widest text-[9px]">Tap to play and learn!</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[55vh] no-scrollbar pb-10">
          <MenuButton icon="🎈" title="Letter Pop" sub="Bubble Spelling" color="bg-rose-500" onClick={() => setActiveGame(GameType.LETTER_POP)} />
          <MenuButton icon="🎨" title="Word Pop" sub="English to Picture" color="bg-sky-400" onClick={() => setActiveGame(GameType.WORD_TO_EMOJI)} />
          <MenuButton icon="🧺" title="Sorting Mania" sub="Category Sorting" color="bg-amber-500" onClick={() => setActiveGame(GameType.SORTING)} />
          <MenuButton icon="👂" title="Ear Detective" sub="Listen & Find" color="bg-orange-400" onClick={() => setActiveGame(GameType.SOUND_TO_EMOJI)} />
          <MenuButton icon="🧩" title="Memory Match" sub="Find the Pairs" color="bg-pink-400" onClick={() => setActiveGame(GameType.MEMORY)} />
          <MenuButton icon="🔍" title="Odd One Out" sub="Find the Intruder" color="bg-indigo-400" onClick={() => setActiveGame(GameType.ODD_ONE_OUT)} />
          <MenuButton icon="🇮🇷" title="Farsi Master" sub="Farsi to Picture" color="bg-green-400" onClick={() => setActiveGame(GameType.FARSI_TO_EMOJI)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 p-4 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => setActiveGame(GameType.MENU)} className="bg-white px-6 py-2 rounded-2xl font-black text-gray-400 shadow-sm border-b-4 border-gray-100 active:translate-y-1 active:border-b-0">⬅️ MENU</button>
        <div className="bg-yellow-400 px-6 py-2 rounded-2xl font-black text-white shadow-lg flex items-center gap-2">
          <span>⭐</span> {score}
        </div>
      </div>

      {activeGame === GameType.LETTER_POP ? (
        <div className="flex flex-col gap-8 flex-1 items-center justify-between py-4">
          <div className="text-center space-y-4 w-full">
             <div className="text-[120px] drop-shadow-2xl animate-bounce">{question?.target.emoji}</div>
             <div className="flex gap-2 justify-center flex-wrap px-4">
                {question?.target.word.split('').map((char: string, i: number) => (
                  <div 
                    key={i} 
                    className={`w-12 h-16 rounded-2xl border-b-[8px] flex items-center justify-center text-4xl font-black transition-all duration-300 ${
                      i < spellingProgress 
                      ? 'bg-green-500 text-white border-green-700 scale-110 shadow-lg' 
                      : 'bg-white text-gray-100 border-gray-200'
                    }`}
                  >
                    {i < spellingProgress ? char.toUpperCase() : ''}
                  </div>
                ))}
             </div>
          </div>

          <div className="relative w-full h-64 flex flex-wrap gap-4 justify-center content-center px-4">
             {scrambledLetters.map((l) => (
               <button
                 key={l.id}
                 onClick={() => handleLetterTap(l)}
                 style={{ animationDelay: `${l.delay}s` }}
                 className={`w-20 h-20 rounded-full text-4xl font-black flex items-center justify-center transition-all duration-300 bubble-style bubble-float ${
                   l.popped 
                   ? 'pop-effect pointer-events-none' 
                   : isCorrect === false ? 'animate-shake border-4 border-rose-300 text-rose-500' : 'text-sky-500'
                 }`}
               >
                 {l.char}
               </button>
             ))}
          </div>
          <div className="h-10"></div> {/* Spacer */}
        </div>
      ) : activeGame === GameType.SORTING ? (
        <div className="flex flex-col gap-10 flex-1 items-center">
          <h3 className="text-2xl font-black text-gray-800 text-center uppercase leading-tight">Where does this belong?</h3>
          <div className="bg-white w-48 h-48 rounded-[40px] shadow-2xl flex items-center justify-center text-9xl animate-bounce border-8 border-amber-50 relative">
            {question?.target.emoji}
            <div className="absolute -bottom-4 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase">
               {question?.target.word}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full mt-auto mb-10">
            {question?.options.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleChoice(cat)}
                className={`aspect-square rounded-[40px] flex flex-col items-center justify-center gap-3 transition-all border-b-[12px] active:translate-y-2 ${
                  isCorrect === true && question.target.category === cat.id ? 'bg-green-400 border-green-600 scale-105' :
                  isCorrect === false && question.target.category !== cat.id ? 'opacity-20 grayscale' : 'bg-white border-gray-100 shadow-xl'
                }`}
              >
                <span className="text-6xl">{cat.icon}</span>
                <span className="font-black text-gray-800 uppercase text-xs">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : activeGame !== GameType.MEMORY ? (
        <div className="flex flex-col gap-8 flex-1">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-gray-800 uppercase">
              {activeGame === GameType.ODD_ONE_OUT ? "Which one is different?" : "Where is the..."}
            </h3>
            {activeGame === GameType.WORD_TO_EMOJI && (
              <div className="inline-block bg-sky-500 text-white px-10 py-4 rounded-[30px] text-4xl font-black shadow-xl animate-bounce">
                {question?.target.word}
              </div>
            )}
            {activeGame === GameType.FARSI_TO_EMOJI && (
              <div className="inline-block bg-green-500 text-white px-10 py-4 rounded-[30px] text-5xl font-black shadow-xl farsi-text animate-pulse">
                {question?.target.translation}
              </div>
            )}
            {activeGame === GameType.SOUND_TO_EMOJI && (
              <button onClick={() => playSpeech(question?.target.word)} className="bg-orange-500 text-white p-8 rounded-full text-5xl shadow-2xl animate-pulse">🔊</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {question?.options.map((option: Flashcard) => (
              <button
                key={option.id}
                onClick={() => handleChoice(option)}
                className={`aspect-square rounded-[40px] text-7xl flex flex-col items-center justify-center gap-2 transition-all border-b-[10px] active:translate-y-2 ${
                  isCorrect === true && option.id === question.target.id ? 'bg-green-100 border-green-500 scale-105' :
                  isCorrect === false && option.id !== question.target.id ? 'opacity-20 grayscale' : 'bg-white border-gray-100 shadow-xl'
                }`}
              >
                {option.emoji}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 items-center">
          <h3 className="text-2xl font-black text-gray-800 uppercase mb-4">Memory Game!</h3>
          <div className="grid grid-cols-2 gap-4 w-full">
            {memoryCards.map((card, idx) => (
              <div key={card.id} className="perspective-1000 aspect-square w-full">
                <button
                  onClick={() => handleMemoryClick(idx)}
                  className={`w-full h-full rounded-[35px] text-6xl flex items-center justify-center transition-all duration-500 preserve-3d relative ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200 border-b-[10px] border-sky-300 rounded-[35px] backface-hidden shadow-lg">
                    <span className="text-sky-400 font-black">?</span>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center bg-white rounded-[35px] rotate-y-180 border-b-[10px] shadow-lg backface-hidden ${card.isMatched ? 'bg-green-50 border-green-400 opacity-60' : 'border-pink-300'}`}>
                    {card.emoji}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuButton: React.FC<{icon: string, title: string, sub: string, color: string, onClick: () => void}> = ({ icon, title, sub, color, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-5 p-5 rounded-[30px] text-white shadow-lg border-b-[6px] active:translate-y-1 active:border-b-0 transition-all ${color} border-black/10`}>
    <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
      {icon}
    </div>
    <div className="text-left">
      <h4 className="text-xl font-black leading-tight">{title}</h4>
      <p className="text-[8px] font-bold opacity-80 uppercase tracking-wider">{sub}</p>
    </div>
    <div className="ml-auto text-2xl opacity-40">👉</div>
  </button>
);

export default GameView;
