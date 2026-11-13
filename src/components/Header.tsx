import React from 'react';
import { Clock, Heart, Lock, Unlock, Mail, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import RotatingEarth from './RotatingEarth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  breakingNews: string;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  isAuthorizedEditor?: boolean;
  currentUser?: User | null;
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  bookmarksCount, 
  onOpenBookmarks,
  breakingNews,
  isAdmin,
  setIsAdmin,
  isAuthorizedEditor = false,
  currentUser,
  onSignInGoogle,
  onSignOutGoogle
}: HeaderProps) {
  const currentDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleToggleAdmin = () => {
    if (!isAuthorizedEditor) return;
    setIsAdmin(!isAdmin);
  };

  return (
    <header className="border-b-4 border-[#991b1b] bg-[#121010] text-[#f5eedc]" id="newspaper-header">
      
      {/* Top Ticker: News Marquee using Cover Colors (Crimson / Deep Black) */}
      <div className="bg-[#000000] text-[#f5eedc] px-4 py-2 flex items-center overflow-hidden text-[11px] font-mono select-none border-b border-[#991b1b]/30" id="ticker-container">
        <span className="bg-[#b91c1c] text-white px-2 py-0.5 rounded font-bold tracking-wider animate-pulse flex items-center gap-1 shrink-0 uppercase text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping"></span>
          PRIME DISPATCH
        </span>
        <div className="ml-3 animate-marquee whitespace-nowrap overflow-hidden flex items-center">
          <span className="mx-4 text-[#f5eedc] font-serif font-bold tracking-wide italic">{breakingNews}</span>
          <span className="mx-4 text-white/30">•</span>
          <span className="mx-4 text-[#ebdcb9] uppercase font-bold tracking-widest">THE CEYLON REVIEW PRINT</span>
          <span className="mx-4 text-white/30">•</span>
        </div>
      </div>

      {/* Main Publication Identity header */}
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 text-center flex flex-col items-center justify-center relative" id="header-identity">
        
        {/* Metabar: Volume / Slogan / Actions */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-[#991b1b]/30 pb-4 mb-4 text-[10px] font-mono text-[#a8a29e] gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">VOL. I • NO. 1</span>
            <span className="text-[#991b1b]/40">|</span>
            <span className="flex items-center gap-1 text-[#f5eedc] font-semibold">
              <Clock size={11} className="text-[#dc2626]" />
              EST. JULY 2026
            </span>
          </div>
          
          <div className="hidden md:block italic font-serif text-[#ef4444] text-xs font-semibold">
            "Everything is connected. Nothing is neutral."
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Contact Email Highlighted */}
            <div className="hidden lg:flex items-center gap-1 bg-[#1e1a1a] text-[#f5eedc] border border-[#991b1b]/30 px-2.5 py-1 rounded" title="Submit Article drafts">
              <Mail size={10} className="text-[#ebdcb9]" />
              <span>Submit: <a href="mailto:theceylonreview@proton.me" className="underline font-bold hover:text-white">theceylonreview@proton.me</a></span>
            </div>

            {/* Editor Access & Controls: Visible ONLY to the logged-in editor email */}
            {isAuthorizedEditor && currentUser && (
              <>
                <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-700/40 px-2.5 py-1 rounded text-emerald-300 font-mono text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">Editor Access:</span>
                  <span className="truncate max-w-[140px]">{currentUser.email}</span>
                  {onSignOutGoogle && (
                    <button 
                      onClick={onSignOutGoogle}
                      className="ml-1 text-red-400 hover:text-red-300 underline cursor-pointer"
                      title="Sign Out"
                    >
                      Logout
                    </button>
                  )}
                </div>

                <span className="hidden sm:inline text-white/20">|</span>

                {/* Admin Toggle */}
                <div className="relative">
                  <button
                    onClick={handleToggleAdmin}
                    className={`flex items-center gap-1.5 px-3 py-1 border rounded transition-all font-mono text-[10px] font-bold uppercase cursor-pointer ${
                      isAdmin 
                        ? 'bg-[#991b1b] text-white border-[#dc2626] shadow-md ring-1 ring-red-500/40' 
                        : 'bg-[#1e1a1a] hover:bg-[#2a2424] border-[#991b1b]/40 text-[#f5eedc]'
                    }`}
                    title="Toggle Editor Mode"
                    id="admin-security-toggle"
                  >
                    {isAdmin ? <Unlock size={10} /> : <Lock size={10} />}
                    {isAdmin ? 'Editor Mode Active (Delete Articles Enabled)' : 'Click to Enable Editor Mode'}
                  </button>
                </div>

                <span className="hidden sm:inline text-white/20">|</span>
              </>
            )}

            <button
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 bg-[#991b1b] hover:bg-[#b91c1c] border border-red-700 text-white px-3 py-1 rounded transition-all font-sans text-[10px] font-bold uppercase cursor-pointer shadow"
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
          className="cursor-pointer select-none group flex flex-col items-center justify-center my-2 hover:opacity-95 transition-opacity" 
          id="main-newspaper-logo"
        >
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
            <RotatingEarth size={108} showLabels className="shrink-0" />
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:block w-6 md:w-8 h-[2px] bg-[#dc2626]" />
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
                the ceylon review
              </h1>
              <div className="hidden sm:block w-6 md:w-8 h-[2px] bg-[#dc2626]" />
            </div>
          </div>
          <p className="font-mono text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.25em] sm:tracking-[0.35em] text-[#ef4444] mt-2.5 uppercase font-extrabold text-center">
            Law, Society & Public Affairs • Independent Ceylon Perspectives
          </p>
        </div>

        {/* Double-Border Column Line */}
        <div className="w-full border-t-2 border-b border-[#991b1b] py-1.5 mt-4 flex justify-between text-[10px] font-mono text-[#a8a29e]">
          <span className="font-bold text-[#f5eedc]">{currentDateString}</span>
          <span className="hidden sm:inline tracking-[0.2em] uppercase font-bold text-[#ef4444]">"EVERYTHING IS CONNECTED. NOTHING IS NEUTRAL."</span>
          <span className="font-bold text-[#f5eedc]">FREE INTERACTIVE EDITION</span>
        </div>
      </div>
    </header>
  );
}
