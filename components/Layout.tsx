
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="h-[100dvh] w-full max-w-md bg-white shadow-2xl flex flex-col relative overflow-hidden">
      {/* Header - Compact for mobile */}
      <header className="bg-yellow-400 p-4 pt-8 rounded-b-[35px] shadow-md flex flex-col items-center flex-shrink-0 z-50">
        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm flex items-center gap-2">
          EXPLORER 🚀
        </h1>
        <div className="bg-yellow-500/30 px-3 py-0.5 rounded-full mt-1">
          <p className="text-white font-bold text-[10px] uppercase tracking-widest">Learning is fun!</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="pb-32"> {/* Space for nav */}
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Floating style for better mobile reach */}
      <nav className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-100 flex justify-around p-3 rounded-[35px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50 pb-safe">
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
    className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 grayscale'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${isActive ? color : 'bg-gray-100'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black mt-1 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
