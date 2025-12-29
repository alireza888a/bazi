
import React, { useState, useRef, useEffect } from 'react';
import { getAI, chatWithAI, playSpeech, encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';
import { BUBBLES_ITEMS } from '../constants';
import { UserStats, BubblesItem } from '../types';
import { Modality } from '@google/genai';

const STATS_KEY = 'little_explorer_stats_v1';

const AIChatView: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    return saved ? JSON.parse(saved) : { stars: 0, unlockedItems: [], equippedItem: null };
  });

  const [messages, setMessages] = useState([{ text: "Hi! I'm Bubbles! 🐻 What's your name?", sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showWardrobe, isLiveActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current = null; // Connection closure is handled by the API internally or by the stream ending
    }
    setIsLiveActive(false);
    setIsListening(false);
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
  };

  const startLiveChat = async () => {
    if (isLiveActive) {
      stopLiveSession();
      return;
    }

    try {
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } // A friendly boyish/bear voice
          },
          systemInstruction: 'You are Bubbles, a magical teddy bear. Use very simple English, short sentences, and lots of emojis. You are talking to a 4-year-old child.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setIsListening(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeAudio(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription) setMessages(prev => [...prev, { text: currentInputTranscription, sender: 'user' }]);
              if (currentOutputTranscription) setMessages(prev => [...prev, { text: currentOutputTranscription, sender: 'ai' }]);
              currentInputTranscription = '';
              currentOutputTranscription = '';
            }

            // Handle Audio Output
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeAudio(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => stopLiveSession()
        }
      });

      liveSessionRef.current = sessionPromise;
    } catch (err) {
      console.error("Microphone access denied or API error", err);
      alert("Oops! I need to hear you to talk! Please check your microphone. 🎤");
    }
  };

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
            <div className={`text-3xl bg-white w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isLiveActive ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110' : 'border-green-400'}`}>🐻</div>
            {equippedEmoji && <div className="absolute -top-1 -right-1 text-2xl animate-bounce">{equippedEmoji}</div>}
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-lg">Bubbles</h3>
            <p className="text-[10px] text-green-600 font-bold">
              {isLiveActive ? '🟢 LISTENING...' : `${stats.stars} ⭐`}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { stopLiveSession(); setShowWardrobe(!showWardrobe); }}
          className={`px-4 py-1.5 rounded-xl font-bold text-[10px] transition-all ${showWardrobe ? 'bg-pink-400 text-white' : 'bg-white text-pink-400 border-2 border-pink-100'}`}
        >
          {showWardrobe ? 'CHAT 💬' : 'CLOSET 👗'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 p-1 mb-4 no-scrollbar">
        {!showWardrobe ? (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] p-4 rounded-[25px] font-bold text-base shadow-sm animate-in fade-in slide-in-from-bottom-2 ${m.sender === 'user' ? 'self-end bg-sky-400 text-white rounded-tr-none' : 'self-start bg-white border-2 border-sky-50 text-gray-800 rounded-tl-none'}`}>
                {m.text}
              </div>
            ))}
            {isListening && (
              <div className="self-start bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-[25px] rounded-tl-none animate-pulse">
                <span className="text-gray-400 font-black italic">Bubbles is listening... 🐻👂</span>
              </div>
            )}
          </>
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
        <div className="flex gap-2 flex-shrink-0 bg-white p-2 border-t border-gray-50 items-center">
          <button 
            onClick={startLiveChat}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all active:scale-90 ${isLiveActive ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'}`}
          >
            {isLiveActive ? '⏹️' : '🎤'}
          </button>
          
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={input} 
              disabled={isLiveActive}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder={isLiveActive ? "Wait for Bubbles..." : "Talk to me..."} 
              className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-sky-300 disabled:opacity-50" 
            />
            <button 
              onClick={() => handleSend(input)} 
              disabled={isLiveActive || !input.trim()}
              className="bg-sky-400 text-white px-5 rounded-xl font-black shadow-md disabled:bg-gray-300"
            >
              🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatView;
