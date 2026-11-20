import React, { useEffect } from 'react';
import { Article, Writer } from '../types';
import { X, Heart, Clock, HeartOff, BookOpen } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedArticles: Article[];
  writers: Writer[];
  onReadArticle: (article: Article) => void;
  onRemoveBookmark: (articleId: string) => void;
}

export default function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarkedArticles,
  writers,
  onReadArticle,
  onRemoveBookmark
}: BookmarksDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAuthorName = (authorId: string) => {
    return writers.find(w => w.id === authorId)?.name || 'Staff Correspondent';
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
      id="bookmarks-drawer-overlay"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border-l-4 border-[#7a1f2b] h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-stone-900"
        onClick={(e) => e.stopPropagation()}
        id="bookmarks-drawer"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#7a1f2b] pb-4 mb-6">
            <h3 className="font-serif text-xl font-black flex items-center gap-2 text-stone-900 uppercase tracking-wide">
              <Heart size={18} className="fill-current text-[#9b2c3b]" />
              Saved Clippings ({bookmarkedArticles.length})
            </h3>
            <button 
              onClick={onClose}
              className="p-1 px-2.5 border border-[#7a1f2b]/50 bg-[#f8eff1] hover:bg-[#f8eff1] text-stone-900 rounded cursor-pointer transition-all font-mono text-[10px] uppercase font-bold"
              id="close-bookmarks-drawer"
            >
              <X size={14} className="inline mr-0.5" />
              Close
            </button>
          </div>

          {/* List items */}
          <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1" id="bookmarks-scroller">
            {bookmarkedArticles.length === 0 ? (
              <div className="text-center py-16 px-4" id="empty-bookmarks">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#9b2c3b]/40 flex items-center justify-center mx-auto mb-4 text-[#9b2c3b]">
                  <HeartOff size={20} />
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900 mb-2 uppercase">No Clippings Filed</h4>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Browse dispatches and click hearts on cards. Clippings will reside here for immediate retrieval.
                </p>
              </div>
            ) : (
              bookmarkedArticles.map((art) => (
                <div 
                  key={art.id}
                  className="border border-[#7a1f2b]/30 p-4 bg-stone-100 hover:bg-stone-100 transition-all duration-150 relative group rounded shadow-md"
                  id={`bookmark-item-${art.id}`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-mono text-[9px] text-[#7a1f2b] uppercase border border-[#7a1f2b]/40 px-1 bg-[#f8eff1] font-bold">
                      {art.category}
                    </span>
                    <button
                      onClick={() => onRemoveBookmark(art.id)}
                      className="p-1 text-stone-500 hover:text-[#7a1f2b] transition-colors cursor-pointer"
                      title="Discard clipping"
                      id={`remove-clip-${art.id}`}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-stone-900 mt-1.5 leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  
                  <p className="font-serif italic text-xs text-stone-700 mt-1.5">
                    Written by {getAuthorName(art.authorId)}
                  </p>

                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#7a1f2b]/20">
                    <span className="font-mono text-[9px] text-stone-600 flex items-center gap-0.5 font-bold">
                      <Clock size={10} className="text-[#7a1f2b]" />
                      {art.readTime}
                    </span>

                    <button
                      onClick={() => onReadArticle(art)}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#7a1f2b] hover:text-[#6a1a26] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      id={`read-clip-${art.id}`}
                    >
                      <BookOpen size={10} />
                      Read Article
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-[#7a1f2b]/30 pt-4 text-center">
          <p className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">The Ceylon Review Reader Index</p>
        </div>
      </div>
    </div>
  );
}
