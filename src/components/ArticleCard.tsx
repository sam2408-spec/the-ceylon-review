import React from 'react';
import { Article, Writer } from '../types';
import { Heart, Clock, MessageSquare, Eye } from 'lucide-react';

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
}

export default function ArticleCard({
  article,
  author,
  onReadMore,
  isBookmarked,
  onToggleBookmark,
  variant = 'grid'
}: ArticleCardProps) {
  
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Politics': return 'bg-[#580a0a]/15 text-[#580a0a] border-[#580a0a]/30';
      case 'Tech': return 'bg-blue-900/15 text-blue-900 border-blue-900/30';
      case 'Science': return 'bg-emerald-900/15 text-emerald-900 border-emerald-900/30';
      case 'Opinion': return 'bg-purple-900/15 text-purple-900 border-purple-900/30';
      case 'Culture': return 'bg-pink-900/15 text-pink-900 border-pink-900/30';
      case 'Business': return 'bg-amber-900/15 text-amber-900 border-amber-900/30';
      default: return 'bg-[#141110]/15 text-[#141110] border-[#141110]/30';
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
        className="group bg-paper-card border-2 border-[#580a0a]/20 hover:border-[#580a0a]/40 select-none overflow-hidden mb-8 transition-all duration-300 flex flex-col lg:flex-row cursor-pointer rounded shadow-sm"
        onClick={() => onReadMore(article)}
        id={`featured-card-${article.id}`}
      >
        <div className="lg:w-3/5 relative h-64 sm:h-96 w-full shrink-0 border-b lg:border-b-0 lg:border-r border-[#580a0a]/15 overflow-hidden">
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
            <span className="bg-[#141110] text-[#f5eedc] border border-[#580a0a]/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              Spotlight Story
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
          <div>
            <h2 className="font-serif text-2xl md:text-3.5xl font-black tracking-tight leading-tight text-[#141110] group-hover:text-[#580a0a] transition-colors duration-300">
              {article.title}
            </h2>
            <h3 className="font-serif italic text-base text-[#5e5347] mt-3 leading-relaxed">
              {article.subtitle}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#5e5347]/85 mt-4 leading-relaxed line-clamp-3">
              {article.summary}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#580a0a]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              {(author || article.authorId === 'w1' || article.authorId === 'w-sameera') && (
                <img 
                  src={author?.avatarUrl || sameeraAvatar} 
                  alt={author?.name || 'Sameera Mahboobdeen'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#580a0a]/20"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = sameeraAvatar;
                  }}
                />
              )}
              <div>
                <p className="font-serif font-bold text-sm text-[#141110] hover:underline">
                  By {author?.name || 'Sameera Mahboobdeen'}
                </p>
                <p className="font-mono text-[10px] text-[#5e5347]">
                  {author?.role || 'Chief Editor'}
                </p>
              </div>
            </div>

            {/* Read Indicators / Saved */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#5e5347]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock size={12} className="text-[#580a0a]" />
                  {article.readTime}
                </span>
                <span className="text-[#580a0a]/25">•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(e, article.id);
                  }}
                  className={`p-2 rounded-sm border cursor-pointer transition-all ${
                    isBookmarked 
                      ? 'bg-[#580a0a] text-white border-[#580a0a]' 
                      : 'bg-[#ebdcb9]/30 hover:bg-[#ebdcb9]/60 border-[#580a0a]/20 text-[#141110]'
                  }`}
                  title={isBookmarked ? "Saved" : "Save clipping"}
                  id={`bookmark-feat-${article.id}`}
                >
                  <Heart size={14} className={isBookmarked ? "fill-current scale-105" : ""} />
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
        className="group border-b border-[#580a0a]/15 py-4 last:border-b-0 cursor-pointer"
        onClick={() => onReadMore(article)}
        id={`sidebar-card-${article.id}`}
      >
        <div className="flex justify-between items-center gap-2 text-[10px] font-mono text-[#5e5347]">
          <span className="text-[#580a0a] uppercase tracking-wider font-extrabold">
            {article.category}
          </span>
          <span>
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="font-serif text-sm md:text-base font-bold text-[#141110] mt-1.5 group-hover:text-[#580a0a] transition-colors duration-200 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="font-sans text-xs text-[#5e5347] mt-2 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center justify-between mt-3 text-[11px]">
          <span className="font-serif italic text-[#141110]/80">
            By {author?.name || 'Staff Writer'}
          </span>
          <span className="font-mono text-[#5e5347] flex items-center gap-0.5 text-[10px] font-bold">
            <Clock size={10} className="text-[#580a0a]" />
            {article.readTime}
          </span>
        </div>
      </article>
    );
  }

  // GRID CARD VARIANT (Standard masonry feed layout)
  return (
    <article 
      className="group bg-paper-card border border-[#580a0a]/25 hover:border-[#580a0a]/55 select-none overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md rounded"
      onClick={() => onReadMore(article)}
      id={`grid-card-${article.id}`}
    >
      <div className="relative h-48 w-full border-b border-[#580a0a]/15 overflow-hidden shrink-0">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(e, article.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-sm border cursor-pointer transition-all ${
            isBookmarked 
              ? 'bg-[#580a0a] text-white border-[#580a0a]' 
              : 'bg-[#141110]/80 hover:bg-[#141110] border-[#580a0a]/10 text-white'
          }`}
          title={isBookmarked ? "Saved" : "Save clipping"}
          id={`bookmark-grid-${article.id}`}
        >
          <Heart size={12} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <div className="font-mono text-[9px] text-[#5e5347] mb-1.5 flex justify-between font-bold">
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readTime}</span>
          </div>
          <h3 className="font-serif text-base font-bold tracking-tight text-[#141110] group-hover:text-[#580a0a] transition-colors duration-200 leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="font-sans text-xs text-[#5e5347] mt-2 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        <div className="pt-3 border-t border-[#580a0a]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(author || article.authorId === 'w1' || article.authorId === 'w-sameera') && (
              <img 
                src={author?.avatarUrl || sameeraAvatar} 
                alt={author?.name || 'Sameera Mahboobdeen'}
                className="w-5 h-5 rounded-full object-cover border border-[#580a0a]/15"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = sameeraAvatar;
                }}
              />
            )}
            <span className="font-serif text-[11px] font-bold text-[#141110]">
              By {author?.name.split(' ').slice(-1)[0] || 'Sameera'} 
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#5e5347] font-mono text-[10px] font-bold">
            <span className="flex items-center gap-0.5">
              <Eye size={11} className="text-[#580a0a]" />
              {article.views}
            </span>
            <span className="text-[#580a0a]/25">•</span>
            <span className="flex items-center gap-0.5">
              <MessageSquare size={11} className="text-[#580a0a]" />
              {article.comments.length}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
