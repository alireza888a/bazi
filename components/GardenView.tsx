
import React, { useState, useEffect } from 'react';
import { GardenPlant } from '../types';
import { playSpeech } from '../services/geminiService';

const GARDEN_KEY = 'explorer_garden_v1';

const GardenView: React.FC = () => {
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(GARDEN_KEY);
    if (saved) {
      setPlants(JSON.parse(saved));
    }
  }, []);

  const getPlantVisual = (level: number) => {
    switch(level) {
      case 1: return '🌱';
      case 2: return '🌿';
      case 3: return '🪴';
      case 4: return '🌸';
      default: return '🌱';
    }
  };

  const handlePlantClick = (plant: GardenPlant) => {
    setSelectedPlant(plant);
    playSpeech(plant.word);
    
    // Auto grow if child visits their plant
    if (plant.growthLevel < 4) {
      const newPlants = plants.map(p => 
        p.wordId === plant.wordId ? { ...p, growthLevel: p.growthLevel + 1 } : p
      );
      setPlants(newPlants);
      localStorage.setItem(GARDEN_KEY, JSON.stringify(newPlants));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ecfdf5] p-4 gap-4 animate-in fade-in duration-500 overflow-hidden relative">
      {/* Garden Sky/Header */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-[35px] text-center shadow-lg border-b-8 border-green-700 relative overflow-hidden">
        <div className="absolute top-2 right-4 text-4xl animate-pulse opacity-50">☀️</div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">My Garden 🪴</h2>
        <p className="text-white/80 font-bold text-[8px] tracking-[0.2em] uppercase mt-1">Visit your words to make them grow!</p>
      </div>

      {/* The Garden Bed */}
      <div className="flex-1 bg-[#dcfce7] rounded-[40px] border-4 border-dashed border-green-200 p-6 overflow-y-auto no-scrollbar shadow-inner grid grid-cols-3 gap-4 content-start">
        {plants.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center h-64 text-center gap-4">
            <div className="text-6xl grayscale opacity-30">🧺</div>
            <p className="font-black text-green-800/40 uppercase text-xs">Your garden is empty!<br/>Learn new words to plant seeds.</p>
          </div>
        ) : (
          plants.map((plant) => (
            <button
              key={plant.wordId}
              onClick={() => handlePlantClick(plant)}
              className="aspect-square bg-white/50 backdrop-blur-sm rounded-[30px] flex flex-col items-center justify-center gap-1 border-b-4 border-green-100 shadow-sm transition-all active:scale-95 group relative"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {getPlantVisual(plant.growthLevel)}
              </div>
              <span className="text-[7px] font-black text-green-700 uppercase">{plant.word}</span>
              {plant.growthLevel === 4 && <div className="absolute -top-1 -right-1 text-xs animate-bounce">✨</div>}
            </button>
          ))
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[50px] p-8 flex flex-col items-center gap-6 shadow-2xl border-8 border-green-400 relative animate-in zoom-in max-w-sm w-full">
            <button onClick={() => setSelectedPlant(null)} className="absolute top-6 right-6 text-2xl">❌</button>
            <div className="text-8xl drop-shadow-xl mb-2">{selectedPlant.emoji}</div>
            <h3 className="text-4xl font-black text-green-600 uppercase tracking-tighter">{selectedPlant.word}</h3>
            <div className="flex gap-2">
               {[1,2,3,4].map(step => (
                 <div key={step} className={`w-8 h-2 rounded-full ${step <= selectedPlant.growthLevel ? 'bg-green-500' : 'bg-gray-100'}`} />
               ))}
            </div>
            <button 
              onClick={() => playSpeech(selectedPlant.word)}
              className="w-full bg-green-500 text-white py-4 rounded-3xl font-black text-xl shadow-[0_6px_0_0_#15803d] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3"
            >
              🔊 LISTEN
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-white/80 p-3 rounded-2xl border-2 border-green-100 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">💡</div>
        <p className="text-[10px] font-bold text-green-800 leading-tight">
          Every time you learn a word in "LEARN" mode, a seed is planted here automatically!
        </p>
      </div>
    </div>
  );
};

export default GardenView;
