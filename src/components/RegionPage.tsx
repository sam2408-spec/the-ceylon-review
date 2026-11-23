import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Article } from '../types';
import { REGIONS, articleRegions } from '../data/regions';
import { FlashPanel, colomboToday } from './FlashCarousel';
import { manualFlash, FlashItem } from '../data/flash';

interface Headline { title: string; link: string; source: string; publishedAt: string | null }

const fallbackImage =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=630';

function ago(iso: string | null): string {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

interface RegionPageProps {
  regionId: string;
  articles: Article[];
  onOpen: (a: Article) => void;
}

export default function RegionPage({ regionId, articles, onOpen }: RegionPageProps) {
  const region = REGIONS.find((r) => r.id === regionId);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setHeadlines([]);
    fetch(`/api/world?region=${encodeURIComponent(regionId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (cancelled) return;
        setHeadlines(Array.isArray(d.items) ? d.items : []);
        setState('ok');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [regionId]);

  if (!region) return null;
  // Flash carousel: items typed in for this region first, then the newest live headlines.
  const flashItems: FlashItem[] = [
    ...manualFlash(regionId, colomboToday()),
    ...headlines.slice(0, 8).map((h) => ({
      date: colomboToday(),
      label: `${h.source}${h.publishedAt ? ` · ${ago(h.publishedAt)}` : ''}`,
      text: h.title,
      link: h.link,
    })),
  ];
  const mine = articles.filter((a) => regionId === 'world' || articleRegions(a).includes(regionId as never));
  const ours = regionId === 'world' ? articles.filter((a) => articleRegions(a).includes('world' as never)) : mine;
  const hasOurs = ours.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8" id={`viewport-region-${regionId}`}>
      <div className="border-b-2 border-[#7a1f2b] pb-3 mb-6">
        <h2 className="font-serif text-3xl md:text-4xl font-black text-[#14264a]">{region.label}</h2>
        <p className="font-mono text-[11px] uppercase tracking-widest text-stone-600 mt-1">
          {regionId === 'world' ? 'The world news column' : `Latest news in ${region.label}`}
        </p>
      </div>

      {flashItems.length > 0 && (
        <div className="mb-8">
          <FlashPanel items={flashItems} tag={region.label} />
        </div>
      )}

      <div className={hasOurs ? 'grid grid-cols-1 lg:grid-cols-12 gap-8' : ''}>
        {hasOurs && (
          <section className="lg:col-span-8" aria-label={`${region.label} features and analysis`}>
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#7a1f2b] mb-4">
              Features and analysis from The Ceylon Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ours.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onOpen(a)}
                  className="text-left bg-white border border-[#7a1f2b]/25 rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-stone-200">
                    <img src={a.imageUrl || fallbackImage} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#7a1f2b]">{a.category}</span>
                    <h4 className="font-serif text-lg font-bold leading-snug text-stone-900 mt-1 group-hover:underline">{a.title}</h4>
                    <p className="text-sm text-stone-700 mt-2 line-clamp-3">{a.summary}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500 mt-3">{a.publishedAt} · {a.readTime}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <aside className={hasOurs ? 'lg:col-span-4 lg:border-l-2 lg:border-[#7a1f2b]/30 lg:pl-8' : ''} aria-label={`${region.label} headlines`}>
          <h3 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#7a1f2b] mb-4">
            {regionId === 'world' ? 'World headlines' : `Latest news in ${region.label}`}
          </h3>
          {state === 'loading' && <p className="font-mono text-xs text-stone-500">Loading headlines…</p>}
          {state === 'error' && <p className="font-mono text-xs text-stone-500">Headlines are unavailable right now. Please try again shortly.</p>}
          {state === 'ok' && headlines.length === 0 && <p className="font-mono text-xs text-stone-500">No headlines found right now.</p>}
          <ul className={`divide-y divide-stone-200 ${hasOurs ? '' : 'md:grid md:grid-cols-2 md:gap-x-10 md:divide-y-0'}`}>
            {headlines.map((h, i) => (
              <li key={i} className={`py-3 ${hasOurs ? '' : 'md:border-b md:border-stone-200'}`}>
                <a href={h.link} target="_blank" rel="noopener noreferrer" className="block group">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#7a1f2b]">
                    {h.source}{h.publishedAt ? ` · ${ago(h.publishedAt)}` : ''}
                  </span>
                  <span className="block font-serif text-base font-bold leading-snug text-stone-900 group-hover:underline mt-0.5">
                    {h.title} <ExternalLink size={12} className="inline text-stone-400" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] text-stone-500 mt-4 leading-relaxed">
            Headlines come from public news feeds and link to the publishers. The Ceylon Review does not edit them.
          </p>
        </aside>
      </div>
    </div>
  );
}
