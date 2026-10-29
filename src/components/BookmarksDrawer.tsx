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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      id="bookmarks-drawer-overlay"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#f5eedc] border-l-4 border-[#580a0a] h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-[#141110]"
        onClick={(e) => e.stopPropagation()}
        id="bookmarks-drawer"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#580a0a] pb-4 mb-6">
            <h3 className="font-serif text-xl font-black flex items-center gap-2 text-[#141110] uppercase tracking-wide">
              <Heart size={18} className="fill-current text-[#580a0a]" />
              Saved Clippings ({bookmarkedArticles.length})
            </h3>
            <button 
              onClick={onClose}
              className="p-1 px-2.5 border border-[#580a0a]/30 bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/80 text-[#141110] rounded cursor-pointer transition-all font-mono text-[10px] uppercase font-bold"
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
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#580a0a]/35 flex items-center justify-center mx-auto mb-4 text-[#580a0a]">
                  <HeartOff size={20} />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#141110] mb-2 uppercase">No Clippings Filed</h4>
                <p className="font-sans text-xs text-[#5e5347] leading-relaxed">
                  Browse dispatches and click hearts on cards. Clippings will reside here for immediate retrieval.
                </p>
              </div>
            ) : (
              bookmarkedArticles.map((art) => (
                <div 
                  key={art.id}
                  className="border border-[#580a0a]/20 p-4 bg-[#fdfbf6] hover:bg-[#ebdcb9]/20 transition-all duration-150 relative group rounded shadow-sm"
                  id={`bookmark-item-${art.id}`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-mono text-[9px] text-[#580a0a] uppercase border border-[#580a0a]/30 px-1 bg-[#ebdcb9]/30 font-bold">
                      {art.category}
                    </span>
                    <button
                      onClick={() => onRemoveBookmark(art.id)}
                      className="p-1 text-[#5e5347] hover:text-[#580a0a] transition-colors cursor-pointer"
                      title="Discard clipping"
                      id={`remove-clip-${art.id}`}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#141110] mt-1.5 leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  
                  <p className="font-serif italic text-xs text-[#5e5347] mt-1.5">
                    Written by {getAuthorName(art.authorId)}
                  </p>

                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#580a0a]/10">
                    <span className="font-mono text-[9px] text-[#5e5347] flex items-center gap-0.5 font-bold">
                      <Clock size={10} className="text-[#580a0a]" />
                      {art.readTime}
                    </span>

                    <button
                      onClick={() => onReadArticle(art)}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#580a0a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
        <div className="border-t border-[#580a0a]/20 pt-4 text-center">
          <p className="text-[10px] font-mono text-[#5e5347] uppercase font-bold tracking-wider">The Ceylon Review Reader Index</p>
        </div>
      </div>
    </div>
  );
}
