
import React, { useState } from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-full w-full bg-white flex flex-col overflow-hidden relative">
      {/* Reduced Height Yellow Header */}
      <header className="w-full bg-[#facc15] pt-6 pb-3 rounded-b-[25px] shadow-md flex flex-col items-center justify-center relative z-40">
        <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 drop-shadow-sm">
          EXPLORER 🚀
        </h1>
        <p className="text-white/90 font-bold text-[6px] uppercase tracking-[0.2em] mt-0.5">
          Learn, Play & Discover
        </p>

        {/* Menu Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -bottom-4 right-6 w-9 h-9 bg-white rounded-full shadow-lg border-[3px] border-[#facc15] flex items-center justify-center text-base active:scale-90 transition-transform z-50"
        >
          {isSidebarOpen ? '❌' : '☰'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 right-0 h-full w-20 bg-white z-[70] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] flex flex-col items-center py-16 gap-5 sidebar-transition overflow-y-auto no-scrollbar ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <NavButton 
          label="LEARN" icon="🖼️" isActive={activeTab === AppTab.CARDS} 
          onClick={() => handleTabChange(AppTab.CARDS)} color="bg-[#38bdf8]"
        />
        <NavButton 
          label="GARDEN" icon="🪴" isActive={activeTab === AppTab.GARDEN} 
          onClick={() => handleTabChange(AppTab.GARDEN)} color="bg-[#22c55e]"
        />
        <NavButton 
          label="ABC" icon="🔤" isActive={activeTab === AppTab.ALPHABET} 
          onClick={() => handleTabChange(AppTab.ALPHABET)} color="bg-[#a855f7]"
        />
        <NavButton 
          label="DRAW" icon="🎨" isActive={activeTab === AppTab.DRAW} 
          onClick={() => handleTabChange(AppTab.DRAW)} color="bg-[#fbbf24]"
        />
        <NavButton 
          label="PLAY" icon="🎮" isActive={activeTab === AppTab.GAME} 
          onClick={() => handleTabChange(AppTab.GAME)} color="bg-[#f472b6]"
        />
        <NavButton 
          label="TALK" icon="🐻" isActive={activeTab === AppTab.AI_CHAT} 
          onClick={() => handleTabChange(AppTab.AI_CHAT)} color="bg-[#4ade80]"
        />
        <NavButton 
          label="AWARDS" icon="🏆" isActive={activeTab === AppTab.AWARDS} 
          onClick={() => handleTabChange(AppTab.AWARDS)} color="bg-[#fb923c]"
        />
      </div>
    </div>
  );
};

const NavButton = ({ label, icon, isActive, onClick, color }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center group shrink-0">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isActive ? color + ' text-white scale-110 shadow-lg' : 'bg-gray-50 text-gray-300 group-active:scale-90'}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black mt-2 transition-colors ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
