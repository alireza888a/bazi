
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden relative shadow-2xl">
      {/* Header - Fixed Top */}
      <header className="bg-yellow-400 pt-8 pb-3 px-6 rounded-b-[35px] shadow-md flex flex-col items-center shrink-0 z-30">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          EXPLORER 🚀
        </h1>
        <p className="text-white/90 font-bold text-[8px] uppercase tracking-widest">Adventure in Learning</p>
      </header>

      {/* Main Container - Allows internal scroll if needed */}
      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>

      {/* Bottom Nav - Fixed Bottom */}
      <div className="px-6 pb-6 pt-2 bg-white shrink-0 z-30">
        <nav className="flex justify-around items-center bg-white p-2 rounded-full shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border border-gray-100">
          <NavButton 
            label="Cards" icon="🖼️" isActive={activeTab === AppTab.CARDS} 
            onClick={() => setActiveTab(AppTab.CARDS)} color="bg-sky-400"
          />
          <NavButton 
            label="Play" icon="🎮" isActive={activeTab === AppTab.GAME} 
            onClick={() => setActiveTab(AppTab.GAME)} color="bg-pink-400"
          />
          <NavButton 
            label="Talk" icon="🐻" isActive={activeTab === AppTab.AI_CHAT} 
            onClick={() => setActiveTab(AppTab.AI_CHAT)} color="bg-green-400"
          />
          <NavButton 
            label="Awards" icon="🏆" isActive={activeTab === AppTab.AWARDS} 
            onClick={() => setActiveTab(AppTab.AWARDS)} color="bg-orange-400"
          />
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ label, icon, isActive, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-12 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-30'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all ${isActive ? color + ' text-white' : 'bg-gray-100'}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black mt-1 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
