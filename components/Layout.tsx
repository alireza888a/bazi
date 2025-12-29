
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="h-[100dvh] w-full max-w-md bg-slate-50 shadow-2xl flex flex-col relative overflow-hidden">
      {/* Header - More Compact */}
      <header className="bg-yellow-400 p-3 pt-6 rounded-b-[30px] shadow-sm flex flex-col items-center flex-shrink-0 z-50">
        <h1 className="text-xl font-black text-white tracking-tight drop-shadow-sm flex items-center gap-2 uppercase">
          Explorer 🚀
        </h1>
        <div className="bg-yellow-500/20 px-3 py-0.5 rounded-full mt-0.5">
          <p className="text-white font-bold text-[8px] uppercase tracking-widest">Learning is fun!</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="pb-28"> {/* Enough space for nav but not too much */}
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 flex justify-around p-2.5 rounded-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 pb-safe">
        <NavButton 
          label="Cards" 
          icon="🖼️" 
          isActive={activeTab === AppTab.CARDS} 
          onClick={() => setActiveTab(AppTab.CARDS)} 
          color="bg-sky-400"
        />
        <NavButton 
          label="Play" 
          icon="🎮" 
          isActive={activeTab === AppTab.GAME} 
          onClick={() => setActiveTab(AppTab.GAME)} 
          color="bg-pink-400"
        />
        <NavButton 
          label="Talk" 
          icon="🐻" 
          isActive={activeTab === AppTab.AI_CHAT} 
          onClick={() => setActiveTab(AppTab.AI_CHAT)} 
          color="bg-green-400"
        />
        <NavButton 
          label="Awards" 
          icon="🏆" 
          isActive={activeTab === AppTab.AWARDS} 
          onClick={() => setActiveTab(AppTab.AWARDS)} 
          color="bg-orange-400"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-40 grayscale'}`}
  >
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm ${isActive ? color : 'bg-gray-100'}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black mt-1 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
