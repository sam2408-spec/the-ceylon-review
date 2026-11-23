import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { FLASH_ITEMS, FLASH_MAX_AGE_DAYS } from '../data/flash';

const ROTATE_MS = 7000;

function colomboToday(): string {
  // en-CA gives YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

function ageInDays(date: string): number {
  return Math.round((Date.parse(colomboToday()) - Date.parse(date)) / 86400000);
}

function niceDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

// Rotating "flash news from Gaza" panel. Moves on by itself, pauses on hover or focus,
// and has buttons and dots for keyboard and touch use.
export default function FlashCarousel() {
  const items = FLASH_ITEMS.filter((i) => ageInDays(i.date) >= 0 && ageInDays(i.date) <= FLASH_MAX_AGE_DAYS);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (items.length < 2 || hover || paused || reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [items.length, hover, paused, reduced]);

  if (items.length === 0) return null;
  const i = index % items.length;
  const item = items[i];
  const go = (d: number) => setIndex((i + d + items.length) % items.length);

  return (
    <section
      aria-label="Flash news from Gaza"
      className="border-2 border-[#5e1620] bg-[#7a1f2b] text-white rounded shadow-sm overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      id="flash-carousel"
    >
      <div className="flex items-stretch">
        <div className="shrink-0 bg-[#5e1620] text-white flex flex-col justify-center px-3 sm:px-4 py-3 border-r border-white/25">
          <span className="font-mono text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Flash
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase opacity-90 mt-0.5">Gaza</span>
        </div>

        <div className="flex-1 px-4 py-3 min-h-[92px]" aria-live={hover || paused ? 'polite' : 'off'}>
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-white/85">
            {item.label} · {niceDate(item.date)}
          </p>
          <p key={i} className="font-serif text-base sm:text-lg font-bold leading-snug text-white mt-1 animate-[fadein_.6s_ease]">
            {item.text}
          </p>
        </div>

        {items.length > 1 && (
          <div className="shrink-0 flex flex-col items-center justify-center gap-1 pr-2 sm:pr-3">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => go(-1)} aria-label="Previous flash" className="p-1 rounded hover:bg-white/15 cursor-pointer text-white"><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume rotation' : 'Pause rotation'} className="p-1 rounded hover:bg-white/15 cursor-pointer text-white">{paused ? <Play size={14} /> : <Pause size={14} />}</button>
              <button type="button" onClick={() => go(1)} aria-label="Next flash" className="p-1 rounded hover:bg-white/15 cursor-pointer text-white"><ChevronRight size={16} /></button>
            </div>
            <div className="flex items-center gap-1" role="tablist" aria-label="Flash items">
              {items.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={n === i}
                  aria-label={`Flash ${n + 1} of ${items.length}`}
                  onClick={() => setIndex(n)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${n === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
