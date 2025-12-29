
import React, { useRef, useState, useEffect } from 'react';
import { transformSketchToCartoon, playSpeech } from '../services/geminiService';

const DrawingView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(8);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [result, setResult] = useState<{url: string, word: string} | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        
        // Initial clean background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setResult(null);
    }
  };

  const handleMagic = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsMagicLoading(true);
    const dataUrl = canvas.toDataURL('image/png');
    
    const magicResult = await transformSketchToCartoon(dataUrl);
    if (magicResult) {
      setResult(magicResult);
      playSpeech(`Wow! It's a ${magicResult.word}!`);
      window.dispatchEvent(new CustomEvent('add-stars', { detail: { count: 15 } }));
    }
    setIsMagicLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white p-4 gap-4 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-amber-400 p-5 rounded-[35px] text-center shadow-lg border-b-8 border-amber-600">
        <h2 className="text-2xl font-black text-white uppercase">Magic Draw ✨</h2>
        <p className="text-white/90 font-bold text-[8px] uppercase tracking-widest mt-1">Draw something and see it come to life!</p>
      </div>

      <div className="relative flex-1 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-200 overflow-hidden shadow-inner group">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {isMagicLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
            <div className="text-6xl animate-bounce">🪄</div>
            <p className="font-black text-amber-600 mt-4 text-xl animate-pulse">BUBBLES IS WORKING MAGIC...</p>
          </div>
        )}

        {result && (
          <div className="absolute inset-4 bg-white rounded-[35px] shadow-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500 border-4 border-amber-200">
            <button onClick={() => setResult(null)} className="absolute top-4 right-4 text-2xl">❌</button>
            <div className="w-full h-2/3 bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-gray-100">
              <img src={result.url} alt="Magic Result" className="w-full h-full object-contain p-2" />
            </div>
            <h3 className="text-4xl font-black text-amber-600 uppercase tracking-tighter mb-2">{result.word}</h3>
            <button 
              onClick={() => playSpeech(result.word)}
              className="bg-amber-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg active:translate-y-1 transition-all flex items-center gap-2"
            >
              🔊 LISTEN
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 shrink-0 bg-white p-2 rounded-[30px] border-2 border-gray-100">
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-2">
            {['#4f46e5', '#ef4444', '#22c55e', '#f59e0b', '#000000'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-gray-400 shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={clearCanvas} className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full active:scale-95">Clear 🗑️</button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleMagic}
            disabled={isMagicLoading}
            className="flex-[2] bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg shadow-amber-200 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
          >
            DO MAGIC! ✨
          </button>
          <div className="flex-1 flex flex-col justify-center px-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
             <input 
              type="range" 
              min="2" 
              max="20" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
             />
             <span className="text-[8px] font-black text-gray-400 uppercase mt-1 text-center">Size</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingView;
