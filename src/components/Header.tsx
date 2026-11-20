import React, { useEffect, useState } from 'react';
import { Clock, Heart, Lock, Unlock, Mail, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import RotatingEarth from './RotatingEarth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  breakingNews: string;
  headlines?: { title: string; source: string; link: string }[];
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
  headlines = [],
  isAdmin,
  setIsAdmin,
  isAuthorizedEditor = false,
  currentUser,
  onSignInGoogle,
  onSignOutGoogle
}: HeaderProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const zoneText = (tz: string) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now).replace(',', '');

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
    <header className="border-b-4 border-[#991b1b] bg-white text-stone-900" id="newspaper-header">
      
      {/* Top Ticker: live world flash headlines (falls back to the house line if the feed is unavailable) */}
      <div className="bg-red-50 text-stone-900 flex items-stretch overflow-hidden text-[11px] font-mono select-none border-b border-[#991b1b]/30" id="ticker-container">
        <div className="relative z-10 shrink-0 bg-red-50 flex items-center gap-1.5 pl-4 pr-3 py-2 border-r border-[#991b1b]/30 shadow-[6px_0_8px_-4px_rgba(254,242,242,1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse"></span>
          <span className="font-black tracking-widest text-[#991b1b] uppercase text-[10px]">World Flash</span>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div
            className="animate-marquee whitespace-nowrap flex items-center"
            style={{ animationDuration: `${Math.max(40, (headlines.length || 3) * 7)}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1}>
                {headlines.length > 0 ? (
                  headlines.map((h, i) => (
                    <React.Fragment key={`${copy}-${i}`}>
                      <a
                        href={h.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-4 flex items-center gap-2 hover:underline"
                        tabIndex={copy === 1 ? -1 : 0}
                      >
                        <span className="text-[#991b1b] font-black tracking-widest text-[9px] uppercase">{h.source}</span>
                        <span className="text-stone-900 font-serif font-bold tracking-wide italic text-[12px]">{h.title}</span>
                      </a>
                      <span className="text-stone-400">•</span>
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <span className="mx-4 text-stone-900 font-serif font-bold tracking-wide italic">{breakingNews}</span>
                    <span className="text-stone-400">•</span>
                    <span className="mx-4 text-stone-700 uppercase font-bold tracking-widest">THE CEYLON REVIEW PRINT</span>
                    <span className="text-stone-400">•</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Publication Identity header */}
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 text-center flex flex-col items-center justify-center relative" id="header-identity">
        
        {/* Metabar: Volume / Slogan / Actions */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-[#991b1b]/30 pb-4 mb-4 text-[10px] font-mono text-stone-600 gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-stone-900 font-semibold tabular-nums">
            <span className="flex items-center gap-1" title="Sri Lanka time">
              <Clock size={11} className="text-[#dc2626]" />
              <span className="text-[#991b1b] font-black">SRI LANKA</span> {zoneText('Asia/Colombo')}
            </span>
            <span className="hidden sm:inline text-[#991b1b]/40">|</span>
            <span className="flex items-center gap-1" title="Palestine time">
              <Clock size={11} className="text-[#dc2626]" />
              <span className="text-[#991b1b] font-black">PALESTINE</span> {zoneText('Asia/Gaza')}
            </span>
          </div>
          
          <div className="hidden md:block italic font-serif text-[#b91c1c] text-xs font-semibold">
            "Everything is connected. Nothing is neutral."
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Contact Email Highlighted */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-100 text-stone-900 border border-[#991b1b]/30 px-2.5 py-1 rounded" title="Submit Article drafts">
              <Mail size={10} className="text-stone-700" />
              <span>Submit: <a href="mailto:theceylonreview@proton.me" className="underline font-bold hover:text-stone-900">theceylonreview@proton.me</a></span>
            </div>

            {/* Editor Access & Controls: Visible ONLY to the logged-in editor email */}
            {isAuthorizedEditor && currentUser && (
              <>
                <div className="flex items-center gap-1.5 bg-emerald-50/20 border border-emerald-700/40 px-2.5 py-1 rounded text-emerald-800 font-mono text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">Editor Access:</span>
                  <span className="truncate max-w-[140px]">{currentUser.email}</span>
                  {onSignOutGoogle && (
                    <button 
                      onClick={onSignOutGoogle}
                      className="ml-1 text-[#991b1b] hover:text-red-800 underline cursor-pointer"
                      title="Sign Out"
                    >
                      Logout
                    </button>
                  )}
                </div>

                <span className="hidden sm:inline text-stone-600">|</span>

                {/* Admin Toggle */}
                <div className="relative">
                  <button
                    onClick={handleToggleAdmin}
                    className={`flex items-center gap-1.5 px-3 py-1 border rounded transition-all font-mono text-[10px] font-bold uppercase cursor-pointer ${
                      isAdmin 
                        ? 'bg-[#991b1b] text-white border-[#dc2626] shadow-md ring-1 ring-red-500/40' 
                        : 'bg-stone-100 hover:bg-stone-100 border-[#991b1b]/40 text-stone-900'
                    }`}
                    title="Toggle Editor Mode"
                    id="admin-security-toggle"
                  >
                    {isAdmin ? <Unlock size={10} /> : <Lock size={10} />}
                    {isAdmin ? 'Editor Mode Active (Delete Articles Enabled)' : 'Click to Enable Editor Mode'}
                  </button>
                </div>

                <span className="hidden sm:inline text-stone-600">|</span>
              </>
            )}

            <button
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 bg-[#991b1b] hover:bg-[#b91c1c] border border-red-700 text-white px-3 py-1 rounded transition-all font-sans text-[10px] font-bold uppercase cursor-pointer shadow"
              id="bookmarks-btn"
            >
              <Heart size={10} className="fill-current text-stone-900" />
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
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-stone-900 uppercase leading-none">
                the ceylon review
              </h1>
              <div className="hidden sm:block w-6 md:w-8 h-[2px] bg-[#dc2626]" />
            </div>
          </div>
          <p className="font-mono text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.25em] sm:tracking-[0.35em] text-[#b91c1c] mt-2.5 uppercase font-extrabold text-center">
            Law, Society & Public Affairs • Independent Ceylon Perspectives
          </p>
        </div>

        {/* Double-Border Column Line */}
        <div className="w-full border-t-2 border-b border-[#991b1b] py-1.5 mt-4 flex justify-between text-[10px] font-mono text-stone-600">
          <span className="font-bold text-stone-900">{currentDateString}</span>
          <span className="hidden sm:inline tracking-[0.2em] uppercase font-bold text-[#b91c1c]">"EVERYTHING IS CONNECTED. NOTHING IS NEUTRAL."</span>
          <a
            href="mailto:theceylonreview@proton.me?subject=Subscribe%20me%20to%20The%20Ceylon%20Review&body=Please%20add%20this%20email%20address%20to%20The%20Ceylon%20Review%20subscriber%20list."
            className="flex items-center gap-1.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-3 py-0.5 rounded font-sans font-bold uppercase tracking-wider transition-colors"
            id="subscribe-btn"
          >
            <Mail size={11} />
            Subscribe
          </a>
        </div>
        <div className="w-full flex justify-end pt-1.5">
          <span className="text-[10px] font-mono italic font-semibold text-[#991b1b]">Founded in July 2026</span>
        </div>
      </div>
    </header>
  );
}
