import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import { FlashItem, manualFlash } from '../data/flash';

const ROTATE_MS = 7000;

export function colomboToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' }); // YYYY-MM-DD
}

function niceDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

interface FlashCarouselProps {
  items: FlashItem[];
  tag: string; // small word under "Flash", e.g. "Gaza"
}

// Rotating flash-news panel. Moves on by itself, pauses on hover or focus, and has buttons
// and dots for keyboard and touch use. Maroon with white lettering.
export function FlashPanel({ items, tag }: FlashCarouselProps) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { setIndex(0); }, [tag, items.length]);

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
      aria-label={`Flash news: ${tag}`}
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
          <span className="font-mono text-[9px] tracking-widest uppercase opacity-90 mt-0.5">{tag}</span>
        </div>

        <div className="flex-1 px-4 py-3 min-h-[92px]" aria-live={hover || paused ? 'polite' : 'off'}>
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-white/85">
            {item.label}
          </p>
          <p key={`${tag}-${i}`} className="font-serif text-base sm:text-lg font-bold leading-snug text-white mt-1 animate-[fadein_.6s_ease]">
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.text} <ExternalLink size={12} className="inline opacity-70" />
              </a>
            ) : (
              item.text
            )}
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
              {items.slice(0, 12).map((_, n) => (
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

// Front page: the typed-in Gaza flashes.
export default function FlashCarousel() {
  const items = manualFlash('palestine', colomboToday());
  return <FlashPanel items={items} tag="Gaza" />;
}
