import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, PenLine } from 'lucide-react';
import { Article, Writer } from '../types';

interface WriterArticleMenuProps {
  writers: Writer[];
  articles: Article[];
  onReadArticle: (article: Article) => void;
}

export default function WriterArticleMenu({ writers, articles, onReadArticle }: WriterArticleMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const groups = useMemo(
    () =>
      writers
        .map((writer) => ({
          writer,
          items: articles
            .filter((a) => a.authorId === writer.id)
            .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')),
        }))
        .filter((g) => g.items.length > 0),
    [writers, articles]
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef} id="read-by-writer-menu">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-full flex items-center gap-1.5 px-3 py-2.5 border border-[#991b1b]/50 bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-mono text-xs font-bold rounded cursor-pointer whitespace-nowrap"
        id="read-by-writer-btn"
      >
        <PenLine size={13} />
        <span>Read by Writer</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-40 w-[min(24rem,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto bg-white border-2 border-[#991b1b]/50 rounded shadow-2xl"
        >
          {groups.length === 0 ? (
            <p className="p-4 text-xs font-mono text-stone-600">No articles published yet.</p>
          ) : (
            groups.map(({ writer, items }) => (
              <div key={writer.id} className="border-b border-[#991b1b]/20 last:border-b-0">
                <div className="sticky top-0 flex items-center justify-between gap-2 px-4 py-2 bg-red-50 border-b border-[#991b1b]/20">
                  <span className="font-serif font-black text-sm text-stone-900">{writer.name}</span>
                  <span className="font-mono text-[10px] font-bold text-[#991b1b] uppercase">
                    {items.length} {items.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <ul>
                  {items.map((article) => (
                    <li key={article.id}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          onReadArticle(article);
                        }}
                        className="w-full text-left px-4 py-2.5 font-serif text-sm text-stone-800 hover:bg-red-50 hover:text-[#991b1b] cursor-pointer border-b border-stone-100 last:border-b-0"
                      >
                        {article.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
