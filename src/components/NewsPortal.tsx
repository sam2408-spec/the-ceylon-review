import React from 'react';
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
          className="w-full relative block text-left overflow-hidden rounded group cursor-pointer min-h-[320px] md:min-h-[440px]"
          id="portal-lead"
        >
          <img
            src={lead.imageUrl || fallbackImage}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
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
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-stone-200">
              {rail.map((a) => (
                <li key={a.id} className="md:border-b md:border-stone-200">
                  <button
                    type="button"
                    onClick={() => onOpen(a)}
                    className="w-full text-left py-3 group cursor-pointer"
                  >
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#7a1f2b]">
                      {a.category}
                    </span>
                    <span className="block font-serif text-lg font-bold text-stone-900 leading-snug group-hover:underline">
                      {a.title}
                    </span>
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
                <div className="aspect-[16/10] overflow-hidden rounded bg-stone-200">
                  <img
                    src={a.imageUrl || fallbackImage}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
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
    </div>
  );
}
