import React, { useState } from 'react';
import { Article, Writer } from '../types';
import { Heart, Clock, MessageSquare, Eye, Trash2 } from 'lucide-react';

const sameeraAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400';
const fallbackArticleImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=630';

interface ArticleCardProps {
  key?: React.Key;
  article: Article;
  author: Writer | undefined;
  onReadMore: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, articleId: string) => void;
  variant?: 'featured' | 'grid' | 'sidebar';
  isAdmin?: boolean;
  onDelete?: (articleId: string) => void;
}

export default function ArticleCard({
  article,
  author,
  onReadMore,
  isBookmarked,
  onToggleBookmark,
  variant = 'grid',
  isAdmin = false,
  onDelete
}: ArticleCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Human Rights': return 'bg-[#f8eff1]/80 text-[#6a1a26] border-[#7a1f2b]/50';
      case 'International Law': return 'bg-sky-50/80 text-sky-900 border-sky-700/50';
      case 'Humanitarian': return 'bg-emerald-50/80 text-emerald-800 border-emerald-700/50';
      case 'Community': return 'bg-orange-50/80 text-orange-900 border-orange-700/50';
      case 'Politics': return 'bg-[#f8eff1]/80 text-[#6a1a26] border-[#7a1f2b]/50';
      case 'Tech': return 'bg-blue-50/80 text-blue-800 border-blue-700/50';
      case 'Science': return 'bg-emerald-50/80 text-emerald-800 border-emerald-700/50';
      case 'Opinion': return 'bg-purple-50/80 text-purple-800 border-purple-700/50';
      case 'Culture': return 'bg-pink-950/80 text-pink-300 border-pink-700/50';
      case 'Business': return 'bg-amber-50/80 text-amber-800 border-amber-700/50';
      default: return 'bg-neutral-900 text-white border-neutral-700';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // FEATURED VARIANT (Large Spotlight Hero, Full Width)
  if (variant === 'featured') {
    return (
      <article 
        className="group bg-white border-2 border-[#7a1f2b]/40 hover:border-[#9b2c3b]/70 select-none overflow-hidden mb-8 transition-all duration-300 flex flex-col lg:flex-row cursor-pointer rounded shadow-xl"
        onClick={() => onReadMore(article)}
        id={`featured-card-${article.id}`}
      >
        <div className="lg:w-3/5 relative h-64 sm:h-96 w-full shrink-0 border-b lg:border-b-0 lg:border-r border-[#7a1f2b]/30 overflow-hidden">
          <img 
            src={article.imageUrl || fallbackArticleImage} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackArticleImage;
            }}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 border rounded uppercase ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <span className="bg-[#7a1f2b] text-white border border-[#9b2c3b] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shadow-sm">
              Spotlight Story
            </span>
          </div>

          {isAdmin && onDelete && (
            <div className="absolute top-4 right-4 flex gap-2">
              {confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-[#f8eff1]/95 text-stone-900 p-1 px-2.5 rounded border border-[#9b2c3b] shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#6a1a26]">Delete story?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(article.id);
                    }}
                    className="bg-[#8a2432] hover:bg-[#7a1f2b] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded cursor-pointer uppercase shadow"
                    id={`confirm-delete-feat-${article.id}`}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                    className="text-[10px] font-mono text-stone-600 hover:text-stone-900 px-1.5 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="bg-[#6a1a26] hover:bg-[#5e1620] text-white border border-[#5e1620] px-3 py-1.5 rounded shadow-lg cursor-pointer transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider"
                  title="Delete article"
                  id={`delete-feat-${article.id}`}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
          <div>
            <h2 className="font-serif text-2xl md:text-3.5xl font-black tracking-tight leading-tight text-stone-900 group-hover:text-[#7a1f2b] transition-colors duration-300">
              {article.title}
            </h2>
            <h3 className="font-serif italic text-base text-stone-700 mt-3 leading-relaxed">
              {article.subtitle}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-stone-700 mt-4 leading-relaxed line-clamp-3">
              {article.summary}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#7a1f2b]/30 flex flex-col justify-between items-start gap-4">
            {/* Author */}
            <div className="flex items-center gap-3 min-w-0">
              {(author || article.authorId === 'w1' || article.authorId === 'w-sameera') && (
                <img 
                  src={author?.avatarUrl || sameeraAvatar} 
                  alt={author?.name || 'Sameera Mahboobdeen'}
                  className="w-10 h-10 shrink-0 rounded-full object-cover border-2 border-[#7a1f2b]/50 shadow-md ring-1 ring-[#9b2c3b]/20"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = sameeraAvatar;
                  }}
                />
              )}
              <div>
                <p className="font-serif font-bold text-sm text-stone-900 hover:underline">
                  By {author?.name || 'Sameera Mahboobdeen'}
                </p>
                <p className="font-mono text-[10px] text-stone-500">
                  {author?.role || 'Chief Editor'}
                </p>
              </div>
            </div>

            {/* Read Indicators / Saved */}
            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                <span className="flex items-center gap-1.5 font-bold whitespace-nowrap">
                  <Clock size={12} className="text-[#9b2c3b]" />
                  {article.readTime}
                </span>
                <span className="text-gray-500">•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && onDelete && (
                  confirmDelete ? (
                    <div className="flex items-center gap-1 bg-[#f8eff1] border border-[#9b2c3b] p-1 rounded" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(article.id);
                        }}
                        className="bg-[#7a1f2b] hover:bg-[#6a1a26] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer uppercase shadow"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(false);
                        }}
                        className="text-[10px] font-mono text-stone-600 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(true);
                      }}
                      className="p-2 rounded-sm border border-[#7a1f2b]/50 bg-red-950/80 hover:bg-[#5e1620] text-[#e6c3ca] cursor-pointer transition-all flex items-center gap-1 font-mono text-[11px] font-bold"
                      title="Delete article"
                      id={`delete-feat-bottom-${article.id}`}
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(e, article.id);
                  }}
                  className={`p-2 rounded-sm border cursor-pointer transition-all ${
                    isBookmarked 
                      ? 'bg-[#7a1f2b] text-white border-[#9b2c3b]' 
                      : 'bg-[#f8eff1] hover:bg-[#f8eff1] border-[#7a1f2b]/40 text-stone-900'
                  }`}
                  title={isBookmarked ? "Saved" : "Save clipping"}
                  id={`bookmark-feat-${article.id}`}
                >
                  <Heart size={14} className={isBookmarked ? "fill-current text-[#9b2c3b] scale-105" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // SIDEBAR VARIANT (Sleek textual presentation for listings)
  if (variant === 'sidebar') {
    return (
      <article 
        className="group border-b border-[#7a1f2b]/25 py-4 last:border-b-0 cursor-pointer"
        onClick={() => onReadMore(article)}
        id={`sidebar-card-${article.id}`}
      >
        <div className="flex justify-between items-center gap-2 text-[10px] font-mono text-stone-600">
          <span className="text-[#7a1f2b] uppercase tracking-wider font-extrabold">
            {article.category}
          </span>
          <div className="flex items-center gap-2">
            <span>
              {formatDate(article.publishedAt)}
            </span>
            {isAdmin && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(article.id);
                    }}
                    className="p-1 px-1.5 bg-[#7a1f2b] text-white text-[9px] font-mono font-bold uppercase rounded cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                    className="text-stone-500 text-[10px] px-1 hover:text-stone-900"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="p-1 text-[#7a1f2b] hover:text-[#6a1a26] hover:bg-[#f8eff1]/60 rounded transition-colors cursor-pointer"
                  title="Delete article"
                  id={`delete-sidebar-${article.id}`}
                >
                  <Trash2 size={12} />
                </button>
              )
            )}
          </div>
        </div>
        <h3 className="font-serif text-sm md:text-base font-bold text-stone-900 mt-1.5 group-hover:text-[#7a1f2b] transition-colors duration-200 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="font-sans text-xs text-stone-700 mt-2 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center justify-between mt-3 text-[11px]">
          <span className="font-serif italic text-stone-800">
            By {author?.name || 'Staff Writer'}
          </span>
          <span className="font-mono text-stone-600 flex items-center gap-0.5 text-[10px] font-bold">
            <Clock size={10} className="text-[#9b2c3b]" />
            {article.readTime}
          </span>
        </div>
      </article>
    );
  }

  // GRID CARD VARIANT (Standard masonry feed layout)
  return (
    <article 
      className="group bg-white border border-[#7a1f2b]/40 hover:border-[#9b2c3b]/70 select-none overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl rounded"
      onClick={() => onReadMore(article)}
      id={`grid-card-${article.id}`}
    >
      <div className="relative h-48 w-full border-b border-[#7a1f2b]/30 overflow-hidden shrink-0">
        <img 
          src={article.imageUrl || fallbackArticleImage} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackArticleImage;
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isAdmin && onDelete && (
            confirmDelete ? (
              <div className="flex items-center gap-1 bg-[#f8eff1]/95 text-stone-900 p-1 rounded border border-[#9b2c3b] shadow-xl" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(article.id);
                  }}
                  className="bg-[#8a2432] hover:bg-[#7a1f2b] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer uppercase shadow"
                  id={`confirm-delete-grid-${article.id}`}
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="text-[10px] text-stone-600 hover:text-stone-900 px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="p-1.5 rounded-sm border border-[#7a1f2b]/50 bg-[#5e1620]/90 hover:bg-[#6a1a26] text-white cursor-pointer transition-all shadow flex items-center gap-1 font-mono text-[9px] font-bold uppercase"
                title="Delete dispatch"
                id={`delete-grid-${article.id}`}
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(e, article.id);
            }}
            className={`p-1.5 rounded-sm border cursor-pointer transition-all ${
              isBookmarked 
                ? 'bg-[#7a1f2b] text-white border-[#9b2c3b]' 
                : 'bg-black/80 hover:bg-black border-[#7a1f2b]/40 text-white'
            }`}
            title={isBookmarked ? "Saved" : "Save clipping"}
            id={`bookmark-grid-${article.id}`}
          >
            <Heart size={12} className={isBookmarked ? "fill-current text-[#9b2c3b]" : ""} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <div className="font-mono text-[9px] text-stone-500 mb-1.5 flex justify-between font-bold">
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readTime}</span>
          </div>
          <h3 className="font-serif text-base font-bold tracking-tight text-stone-900 group-hover:text-[#7a1f2b] transition-colors duration-200 leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="font-sans text-xs text-stone-700 mt-2 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        <div className="pt-3 border-t border-[#7a1f2b]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(author || article.authorId === 'w1' || article.authorId === 'w-sameera') && (
              <img 
                src={author?.avatarUrl || sameeraAvatar} 
                alt={author?.name || 'Sameera Mahboobdeen'}
                className="w-5 h-5 rounded-full object-cover border border-[#7a1f2b]/40"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = sameeraAvatar;
                }}
              />
            )}
            <span className="font-serif text-[11px] font-bold text-stone-900">
              By {author?.name.split(' ').slice(-1)[0] || 'Sameera'} 
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(article.id);
                    }}
                    className="bg-[#7a1f2b] hover:bg-[#6a1a26] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer uppercase shadow"
                    id={`footer-confirm-delete-${article.id}`}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                    className="text-stone-500 text-[10px] px-1 hover:text-stone-900 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="flex items-center gap-1 text-[#e6c3ca] hover:text-white bg-red-950/80 hover:bg-[#5e1620] border border-[#7a1f2b]/50 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase transition-colors cursor-pointer"
                  title="Delete this article permanently"
                  id={`footer-delete-${article.id}`}
                >
                  <Trash2 size={10} />
                  <span>Delete</span>
                </button>
              )
            )}

            <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[10px] font-bold">
              <span className="flex items-center gap-0.5">
                <Eye size={11} className="text-[#9b2c3b]" />
                {article.views}
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-0.5">
                <MessageSquare size={11} className="text-[#9b2c3b]" />
                {article.comments.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
