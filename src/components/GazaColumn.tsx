import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface GazaItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
}

const ago = (iso: string | null) => {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const d = Math.round(hrs / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
};

// "From Gaza" column: the latest headlines about Gaza from public news feeds, linking to the publisher.
export default function GazaColumn() {
  const [items, setItems] = useState<GazaItem[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/gaza');
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (alive) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setState('ok');
        }
      } catch {
        if (alive) setState('error');
      }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="bg-white border border-stone-300 border-t-4 border-t-[#007A3D] rounded shadow-lg p-4" id="gaza-column">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7a1f2b] animate-pulse" />
        <h3 className="font-serif text-xl font-black text-stone-900 leading-none">From Gaza</h3>
      </div>
      <p className="font-sans text-[11px] text-stone-500 mb-3">
        Latest reports from independent and international news sites. Each headline opens the publisher's page.
      </p>

      {state === 'loading' && <p className="font-sans text-xs text-stone-500">Loading the latest reports…</p>}
      {state === 'error' && (
        <p className="font-sans text-xs text-stone-600">
          Reports could not be loaded right now. Please try again shortly.
        </p>
      )}
      {state === 'ok' && items.length === 0 && (
        <p className="font-sans text-xs text-stone-600">No new reports at the moment.</p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-stone-200 max-h-[420px] overflow-y-auto pr-1">
          {items.map((it) => (
            <li key={it.link}>
              <a href={it.link} target="_blank" rel="noopener noreferrer" className="group block py-2.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#7a1f2b] font-bold">
                  {it.source}
                  {it.publishedAt ? ` · ${ago(it.publishedAt)}` : ''}
                </span>
                <span className="block font-serif text-[15px] font-bold text-stone-900 leading-snug group-hover:underline">
                  {it.title} <ExternalLink size={11} className="inline text-stone-400" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <a
        href="https://www.litigating4palestine.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-3 block rounded border border-[#007A3D]/30 bg-[#007A3D]/5 p-3"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#007A3D] font-bold">
          Legal resource
        </span>
        <span className="block font-serif text-[15px] font-bold text-stone-900 leading-snug group-hover:underline">
          Litigating for Palestine <ExternalLink size={11} className="inline text-stone-400" />
        </span>
        <span className="block font-sans text-[11px] text-stone-600 mt-0.5">
          A legal accountability toolkit for holding individuals, states and corporations accountable under international law.
        </span>
      </a>
    </div>
  );
}
