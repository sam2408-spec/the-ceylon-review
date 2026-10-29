import React from 'react';
import { Newspaper, ChevronDown, Sparkles } from 'lucide-react';

interface CoverPageProps {
  onUnfold: () => void;
}

export default function CoverPage({ onUnfold }: CoverPageProps) {
  return (
    <div className="w-full max-w-5xl mx-auto border-4 border-[#580a0a] shadow-2xl overflow-hidden bg-[#f5eedc] mb-8 select-none" id="digital-cover-stage">
      {/* Interactive Ribbon */}
      <div className="bg-[#580a0a] text-[#f5eedc] px-4 py-2 flex justify-between items-center text-xs font-mono border-b border-[#141110]/20">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <Newspaper size={12} className="text-[#f5eedc] animate-pulse" />
          Interactive Broadside Cover
        </span>
        <button 
          onClick={onUnfold}
          className="bg-[#141110] hover:bg-[#141110]/80 text-[#f5eedc] px-3 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all uppercase cursor-pointer"
        >
          <span>Unfold & Read Edition</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Main Structural Cover Page (Matches Uploaded Jpeg Exactly) */}
      <div className="relative flex flex-col h-[520px] sm:h-[620px] w-full bg-[#580a0a]" id="cover-canvas">
        
        {/* BAND 1 (Top): Solid Crimson Band */}
        <div className="h-[15%] bg-[#580a0a] w-full border-b-2 border-black/10" />

        {/* BAND 2: Massive Ivory Cream Central Column */}
        <div className="h-[46%] bg-[#f5eedc] w-full flex flex-col justify-center items-center relative px-6 overflow-hidden">
          {/* Top Elegant Horizontal Line (Matches Image) */}
          <div className="w-[90%] max-w-3xl h-[2px] bg-[#580a0a] absolute top-6" />

          {/* Large Serif Title "The Ceylon Review" Centered (Matches Image Casing & Font) */}
          <div className="text-center font-serif text-[#141110] flex flex-col justify-center items-center select-all select-none">
            <h1 className="text-5xl sm:text-7xl md:text-8.5xl font-black tracking-tight leading-[0.8] font-serif text-[#141110] text-center" style={{ fontFamily: 'Georgia, serif' }}>
              The Ceylon
            </h1>
            <h1 className="text-5xl sm:text-7xl md:text-8.5xl font-black tracking-tight leading-[0.8] font-serif text-[#141110] text-center mt-3 sm:mt-5" style={{ fontFamily: 'Georgia, serif' }}>
              Review
            </h1>
          </div>
        </div>

        {/* BAND 3: Dark Charcoal Brand Band with Italic Slogan */}
        <div className="h-[24%] bg-[#141110] w-full flex flex-col justify-center items-center relative px-6 py-4 border-t-2 border-b-2 border-[#580a0a]">
          {/* Subtle Fine Divider Lines (Matches Image) */}
          <div className="w-[90%] max-w-3xl h-[1px] bg-[#580a0a]/40 absolute top-4" />
          <div className="w-[90%] max-w-3xl h-[1px] bg-[#580a0a]/40 absolute bottom-4" />

          {/* Slogan */}
          <p className="font-serif italic text-sm sm:text-[18px] md:text-[22px] tracking-wide text-[#f5eedc] text-center max-w-2xl px-4 select-all leading-normal" style={{ fontFamily: 'Georgia, serif' }}>
            Everything is connected. Nothing is neutral.
          </p>
        </div>

        {/* BAND 4 (Bottom): Solid Crimson Band */}
        <div className="h-[15%] bg-[#580a0a] w-full border-t border-[#141110]/30" />

        {/* Overlay Hover hint */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black-[4%] transition-all flex items-end justify-center pb-8 pointer-events-none">
          <div className="bg-[#141110] text-[#f5eedc] text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded-full shadow-lg border border-[#580a0a]/30 flex items-center gap-1.5 animate-bounce">
            <Sparkles size={11} className="text-amber-400" />
            Click fold button above to read
          </div>
        </div>
      </div>
    </div>
  );
}
