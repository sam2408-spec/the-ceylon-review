import React from 'react';
import { BAND_QUOTES, BAND_INTERVAL_MS } from '../data/quotes';
import { Article } from '../types';

const fallbackImage =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=630';

interface NewsPortalProps {
  articles: Article[];
  onOpen: (article: Article) => void;
}

// News-portal layout for the Current News front page: one big lead story with the
// headline over the picture, a "Top stories" rail beside it, then a three-column
// "Latest" grid of picture cards.
export default function NewsPortal({ articles, onOpen }: NewsPortalProps) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;
  const rail = rest.slice(0, 4);
  const latest = rest.slice(4);

  return (
    <div className="space-y-10" id="news-portal">
      <section className="space-y-6" id="portal-top">
        <button
          type="button"
          onClick={() => onOpen(lead)}
          className="w-full relative block text-left overflow-hidden rounded group cursor-pointer min-h-[320px] md:min-h-[440px] bg-gradient-to-br from-[#14264a] via-[#2a2250] to-[#7a1f2b] shadow-lg"
          id="portal-lead"
        >
          <img
            src={lead.imageUrl || fallbackImage}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== fallbackImage) img.src = fallbackImage;
              else img.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-5 md:p-8 min-h-[320px] md:min-h-[440px]">
            <span className="self-start bg-[#7a1f2b] text-white font-sans text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3">
              {lead.category}
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-black text-white leading-tight group-hover:underline decoration-2 underline-offset-4">
              {lead.title}
            </h2>
            <p className="mt-3 font-sans text-sm md:text-base text-white/85 leading-snug line-clamp-3 max-w-3xl">
              {lead.subtitle || lead.summary}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-white/70">
              {lead.publishedAt} · {lead.readTime}
            </p>
          </div>
        </button>

        {rail.length > 0 && (
          <aside id="portal-rail">
            <h3 className="font-sans text-xs font-black uppercase tracking-[0.18em] text-[#7a1f2b] border-b-2 border-[#7a1f2b] pb-2 mb-1">
              Top stories
            </h3>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
              {rail.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(a)}
                    className="w-full text-left group cursor-pointer"
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded bg-gradient-to-br from-[#14264a] to-[#7a1f2b]">
                      <img
                        src={a.imageUrl || fallbackImage}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.src !== fallbackImage) img.src = fallbackImage;
                          else img.style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <span className="block mt-3 font-sans text-[10px] font-bold uppercase tracking-widest text-[#7a1f2b]">
                      {a.category}
                    </span>
                    <span className="block font-serif text-xl font-bold text-stone-900 leading-snug group-hover:underline">
                      {a.title}
                    </span>
                    {(a.subtitle || a.summary) && (
                      <span className="block font-sans text-sm text-stone-600 leading-snug mt-1 line-clamp-2">
                        {a.subtitle || a.summary}
                      </span>
                    )}
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-1">
                      {a.publishedAt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </section>

      {latest.length > 0 && (
        <section id="portal-latest">
          <h3 className="font-sans text-xs font-black uppercase tracking-[0.18em] text-[#7a1f2b] border-b-2 border-[#7a1f2b] pb-2 mb-5">
            Latest
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onOpen(a)}
                className="text-left group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden rounded bg-gradient-to-br from-[#14264a] to-[#7a1f2b]">
                  <img
                    src={a.imageUrl || fallbackImage}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src !== fallbackImage) img.src = fallbackImage;
                      else img.style.display = 'none';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <span className="block mt-3 font-sans text-[10px] font-bold uppercase tracking-widest text-[#7a1f2b]">
                  {a.category}
                </span>
                <span className="block font-serif text-lg font-bold text-stone-900 leading-snug group-hover:underline">
                  {a.title}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-1">
                  {a.publishedAt}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      <QuoteBand />
    </div>
  );
}

// Blue statement band: a new quote every five minutes, in rotation. The slot is taken from the
// clock, so every visitor sees the same quote at the same time.
function QuoteBand() {
  const slot = () => Math.floor(Date.now() / BAND_INTERVAL_MS);
  const [n, setN] = React.useState(slot);
  React.useEffect(() => {
    const wait = BAND_INTERVAL_MS - (Date.now() % BAND_INTERVAL_MS);
    let every: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setN(slot());
      every = setInterval(() => setN(slot()), BAND_INTERVAL_MS);
    }, wait);
    return () => {
      clearTimeout(first);
      if (every) clearInterval(every);
    };
  }, []);
  const q = BAND_QUOTES[n % BAND_QUOTES.length];
  return (
    <section className="rounded bg-[#14264a] text-white px-6 py-8 md:px-10 md:py-10 border-l-8 border-[#7a1f2b]" id="portal-quote">
      <div key={n} className="animate-[fadein_.8s_ease]">
        <p className="font-serif text-2xl md:text-3xl font-bold leading-snug">
          {q.by ? `“${q.text}”` : q.text}
        </p>
        {q.by && (
          <p className="mt-4 font-serif text-lg text-white/90">
            {q.by}
          </p>
        )}
        {q.source && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
            {q.source}
          </p>
        )}
      </div>
    </section>
  );
}
