import React from 'react';
import { Newspaper, ChevronDown, Sparkles } from 'lucide-react';
import RotatingEarth from './RotatingEarth';

interface CoverPageProps {
  onUnfold: () => void;
}

export default function CoverPage({ onUnfold }: CoverPageProps) {
  return (
    <div className="w-full max-w-5xl mx-auto border-4 border-[#991b1b] shadow-2xl overflow-hidden bg-[#141212] mb-8 select-none" id="digital-cover-stage">
      {/* Interactive Ribbon */}
      <div className="bg-[#991b1b] text-white px-4 py-2 flex justify-between items-center text-xs font-mono border-b border-black/40">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <Newspaper size={12} className="text-white animate-pulse" />
          Interactive Broadside Cover
        </span>
        <button 
          onClick={onUnfold}
          className="bg-black hover:bg-neutral-900 text-white px-3 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all uppercase cursor-pointer border border-red-500/30"
        >
          <span>Unfold & Read Edition</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Main Structural Cover Page */}
      <div className="relative flex flex-col h-[560px] sm:h-[670px] w-full bg-[#991b1b]" id="cover-canvas">
        
        {/* BAND 1 (Top): Solid Crimson Band */}
        <div className="h-[11%] bg-[#991b1b] w-full border-b-2 border-black/20" />

        {/* BAND 2: Central Column */}
        <div className="h-[52%] bg-[#0f0d0d] w-full flex flex-col justify-center items-center relative px-6 overflow-hidden">
          {/* Top Elegant Horizontal Line */}
          <div className="w-[90%] max-w-3xl h-[2px] bg-[#991b1b] absolute top-5" />

          {/* Large Serif Title "The Ceylon Review" Centered */}
          <div className="text-center font-serif text-white flex flex-col justify-center items-center select-all select-none">
            <RotatingEarth size={124} showLabels className="mb-2" />
            <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-black tracking-tight leading-[0.85] font-serif text-white text-center" style={{ fontFamily: 'Georgia, serif' }}>
              The Ceylon
            </h1>
            <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-black tracking-tight leading-[0.85] font-serif text-white text-center mt-2 sm:mt-3" style={{ fontFamily: 'Georgia, serif' }}>
              Review
            </h1>
          </div>
        </div>

        {/* BAND 3: Dark Charcoal Brand Band with Italic Slogan */}
        <div className="h-[24%] bg-[#171414] w-full flex flex-col justify-center items-center relative px-6 py-4 border-t-2 border-b-2 border-[#991b1b]">
          {/* Subtle Fine Divider Lines */}
          <div className="w-[90%] max-w-3xl h-[1px] bg-[#991b1b]/40 absolute top-4" />
          <div className="w-[90%] max-w-3xl h-[1px] bg-[#991b1b]/40 absolute bottom-4" />

          {/* Slogan */}
          <p className="font-serif italic text-sm sm:text-[18px] md:text-[22px] tracking-wide text-white text-center max-w-2xl px-4 select-all leading-normal" style={{ fontFamily: 'Georgia, serif' }}>
            Everything is connected. Nothing is neutral.
          </p>
        </div>

        {/* BAND 4 (Bottom): Solid Crimson Band */}
        <div className="h-[13%] bg-[#991b1b] w-full border-t border-black/30" />

        {/* Overlay Hover hint */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black-[4%] transition-all flex items-end justify-center pb-8 pointer-events-none">
          <div className="bg-[#141110] text-[#f5eedc] text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded-full shadow-lg border border-[#991b1b]/50 flex items-center gap-1.5 animate-bounce">
            <Sparkles size={11} className="text-amber-400" />
            Click fold button above to read
          </div>
        </div>
      </div>
    </div>
  );
}
