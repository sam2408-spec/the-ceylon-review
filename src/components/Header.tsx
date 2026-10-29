import React from 'react';
import { Clock, Heart, Lock, Unlock, Mail } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  breakingNews: string;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  bookmarksCount, 
  onOpenBookmarks,
  breakingNews,
  isAdmin,
  setIsAdmin
}: HeaderProps) {
  const currentDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleToggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <header className="border-b-4 border-[#580a0a] bg-[#f5eedc] text-[#141110]" id="newspaper-header">
      
      {/* Top Ticker: News Marquee using Cover Colors (Crimson / Dark Charcoal) */}
      <div className="bg-[#141110] text-[#f5eedc] px-4 py-2 flex items-center overflow-hidden text-[11px] font-mono select-none" id="ticker-container">
        <span className="bg-[#580a0a] text-white px-2 py-0.5 rounded font-bold tracking-wider animate-pulse flex items-center gap-1 shrink-0 uppercase text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5eedc] inline-block animate-ping"></span>
          PRIME DISPATCH
        </span>
        <div className="ml-3 animate-marquee whitespace-nowrap overflow-hidden flex items-center">
          <span className="mx-4 text-[#f5eedc] font-serif font-bold tracking-wide italic">{breakingNews}</span>
          <span className="mx-4 text-white/30">•</span>
          <span className="mx-4 text-[#e0cfab] uppercase font-bold tracking-widest">THE CEYLON REVIEW PRINT</span>
          <span className="mx-4 text-white/30">•</span>
        </div>
      </div>

      {/* Main Publication Identity header */}
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 text-center flex flex-col items-center justify-center relative" id="header-identity">
        
        {/* Metabar: Volume / Slogan / Actions */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-[#580a0a]/20 pb-4 mb-4 text-[10px] font-mono text-[#5e5347] gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold">VOL. I • NO. 1</span>
            <span className="text-[#580a0a]/30">|</span>
            <span className="flex items-center gap-1 text-[#141110] font-semibold">
              <Clock size={11} className="text-[#580a0a]" />
              EST. JULY 2026
            </span>
          </div>
          
          <div className="hidden md:block italic font-serif text-[#580a0a]/75 text-xs font-semibold">
            "Everything is connected. Nothing is neutral."
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            
            {/* Contact Email Highlighted */}
            <div className="flex items-center gap-1 bg-[#141110] text-[#f5eedc] px-2.5 py-1 rounded" title="Submit Article drafts">
              <Mail size={10} className="text-[#ebdcb9]" />
              <span>Submit: <a href="mailto:theceylonreview@proton.me" className="underline font-bold hover:text-white">theceylonreview@proton.me</a></span>
            </div>

            <span className="hidden sm:inline text-black/10">|</span>

            {/* Admin Toggle */}
            <div className="relative">
              <button
                onClick={handleToggleAdmin}
                className={`flex items-center gap-1.5 px-3 py-1 border rounded transition-all font-mono text-[10px] font-bold uppercase cursor-pointer ${
                  isAdmin 
                    ? 'bg-[#580a0a] text-white border-[#580a0a]' 
                    : 'bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/80 border-[#580a0a]/25 text-[#141110]'
                }`}
                title="Editor Administration Console"
                id="admin-security-toggle"
              >
                {isAdmin ? <Unlock size={10} /> : <Lock size={10} />}
                {isAdmin ? 'Editor Mode Active' : 'Editor Access'}
              </button>
            </div>

            <span className="hidden sm:inline text-black/10">|</span>

            <button 
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 bg-[#580a0a] hover:bg-[#731212] border border-[#580a0a]/30 text-white px-3 py-1 rounded transition-all font-sans text-[10px] font-bold uppercase cursor-pointer"
              id="bookmarks-btn"
            >
              <Heart size={10} className="fill-current text-[#f5eedc]" />
              Clippings ({bookmarksCount})
            </button>
          </div>
        </div>

        {/* Master Brand Title */}
        <div 
          onClick={() => setActiveTab('current')}
          className="cursor-pointer select-none group flex flex-col items-center justify-center my-3 hover:opacity-95 transition-opacity" 
          id="main-newspaper-logo"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-[2px] bg-[#580a0a]" />
            <h1 className="font-serif text-5xl md:text-7.5xl font-black tracking-tight text-[#141110] uppercase leading-none">
              the ceylon review
            </h1>
            <div className="w-8 h-[2px] bg-[#580a0a]" />
          </div>
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] text-[#580a0a] mt-3 uppercase font-extrabold">
            Law, Society & Public Affairs • Independent Ceylon Perspectives
          </p>
        </div>

        {/* Double-Border Column Line */}
        <div className="w-full border-t-2 border-b border-[#580a0a] py-1.5 mt-4 flex justify-between text-[10px] font-mono text-[#5e5347]">
          <span className="font-bold">{currentDateString}</span>
          <span className="hidden sm:inline tracking-[0.2em] uppercase font-bold text-[#580a0a]/80">"EVERYTHING IS CONNECTED. NOTHING IS NEUTRAL."</span>
          <span className="font-bold">FREE INTERACTIVE EDITION</span>
        </div>
      </div>
    </header>
  );
}
