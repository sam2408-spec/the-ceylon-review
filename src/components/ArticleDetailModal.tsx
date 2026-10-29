import React, { useState, useEffect } from 'react';
import { Article, Writer, Comment, Category } from '../types';

const sameeraAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400';
const fallbackArticleImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=630';

import { 
  X, Heart, Clock, Send, MessageSquare, ThumbsUp, Calendar, ArrowLeft, 
  ShieldAlert, Edit3, Save, RotateCcw, FileText, Check, AlertTriangle,
  Share2, Mail, Facebook, Twitter, Linkedin, Trash2
} from 'lucide-react';

interface ArticleDetailModalProps {
  article: Article;
  author: Writer | undefined;
  writers: Writer[];
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  onLike: (articleId: string) => void;
  onAddComment: (articleId: string, commenterName: string, commentText: string) => void;
  isAdmin?: boolean;
  onDeleteComment?: (articleId: string, commentId: string) => void;
  onEditArticle?: (articleId: string, updatedFields: Partial<Article>) => void;
  onDeleteArticle?: (articleId: string) => void;
}

export default function ArticleDetailModal({
  article,
  author,
  writers,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onLike,
  onAddComment,
  isAdmin = false,
  onDeleteComment,
  onEditArticle,
  onDeleteArticle
}: ArticleDetailModalProps) {
  // Find current Editor-in-Chief from writers list dynamically
  const editorInChief = writers.find(w => w.id === 'w-sameera' || w.role.toLowerCase().includes('editor')) || writers[0];
  const editorName = editorInChief ? editorInChief.name : "Sameera Mahboobdeen";
  const editorBio = editorInChief ? editorInChief.bio : "Sameera Mahboobdeen reports in-depth on postcolonial jurisprudence, executive authority, and state security frameworks. Sourcing analysis directly from archival gazettes and supreme court submissions, focus is placed on civil liberties across the Indian Ocean.";
  const editorAvatar = editorInChief ? editorInChief.avatarUrl : sameeraAvatar;

  // Escape key listener & Body scroll lock
  useEffect(() => {
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
  }, [onClose]);

  // Commenting States
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(article.title);
  const [editSubtitle, setEditSubtitle] = useState(article.subtitle);
  const [editCategory, setEditCategory] = useState(article.category);
  const [editSummary, setEditSummary] = useState(article.summary);
  const [editImageUrl, setEditImageUrl] = useState(article.imageUrl);
  const [editReadTime, setEditReadTime] = useState(article.readTime);
  const [editAuthorId, setEditAuthorId] = useState(article.authorId);
  const [editIsCurrent, setEditIsCurrent] = useState(article.isCurrent);
  const [editIsFeatured, setEditIsFeatured] = useState(article.isFeatured || false);
  const [editContent, setEditContent] = useState(article.content.join('\n\n'));

  // Sync state whenever the active article changes
  useEffect(() => {
    setEditTitle(article.title);
    setEditSubtitle(article.subtitle);
    setEditCategory(article.category);
    setEditSummary(article.summary);
    setEditImageUrl(article.imageUrl);
    setEditReadTime(article.readTime);
    setEditAuthorId(article.authorId);
    setEditIsCurrent(article.isCurrent);
    setEditIsFeatured(article.isFeatured || false);
    setEditContent(article.content.join('\n\n'));
    setIsEditing(false);
    setHasLiked(false);
  }, [article]);

  const handleLike = () => {
    if (!hasLiked) {
      onLike(article.id);
      setHasLiked(true);
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.href.split('?')[0];
    const shareableLink = `${currentUrl}?article=${article.id}`;
    navigator.clipboard.writeText(shareableLink);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;
    onAddComment(article.id, name.trim(), commentText.trim());
    setName('');
    setCommentText('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !onEditArticle) return;

    const paragraphs = editContent
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onEditArticle(article.id, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      category: editCategory,
      summary: editSummary.trim(),
      imageUrl: editImageUrl.trim(),
      readTime: editReadTime.trim(),
      authorId: editAuthorId,
      isCurrent: editIsCurrent,
      isFeatured: editIsFeatured,
      content: paragraphs.length > 0 ? paragraphs : [editSummary.trim()]
    });

    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const categoriesList: Category[] = ['Politics', 'Tech', 'Science', 'Opinion', 'Culture', 'Business'];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      id="article-detail-backdrop"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#f5eedc] border-2 border-[#580a0a] text-[#141110] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="reader-panel"
      >
        {/* Top Sticky Bar */}
        <div className="sticky top-0 bg-[#f5eedc] border-b border-[#580a0a]/30 py-3.5 px-4 md:px-6 flex items-center justify-between z-10 backdrop-blur-md">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#141110] hover:text-[#580a0a] transition-colors bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/80 px-3 py-1.5 border border-[#580a0a]/25 cursor-pointer rounded"
            id="close-back-btn"
          >
            <ArrowLeft size={12} />
            Back to Newspaper
          </button>

          <div className="flex items-center gap-2">
            {/* SOLEMN EDIT BUTTON (Admin mode page lock) */}
            {isAdmin && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1.5 px-3 border cursor-pointer transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold rounded ${
                  isEditing 
                    ? 'bg-[#580a0a] text-white border-[#580a0a]' 
                    : 'bg-[#ebdcb9]/70 hover:bg-[#ebdcb9]/90 text-[#580a0a] border-[#580a0a]/30'
                }`}
                id="edit-article-mode-btn"
              >
                <Edit3 size={11} />
                {isEditing ? 'Exit Editor Desk' : 'Modify Article Text'}
              </button>
            )}

            {!isEditing && (
              <>
                <button
                  onClick={() => onToggleBookmark(article.id)}
                  className={`p-1.5 px-2.5 border border-[#580a0a]/30 cursor-pointer transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold rounded ${
                    isBookmarked 
                      ? 'bg-[#580a0a] text-white border-[#580a0a]' 
                      : 'bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/80 text-[#141110]'
                  }`}
                  id="bookmark-reader-toggle"
                >
                  <Heart size={12} className={isBookmarked ? "fill-current" : ""} />
                  {isBookmarked ? 'Saved' : 'Save Clipping'}
                </button>
                <button 
                  onClick={handleShare}
                  className="p-1.5 px-2.5 bg-[#ebdcb9]/40 border border-[#580a0a]/30 hover:bg-[#ebdcb9]/80 text-[#141110] font-mono text-[11px] font-bold cursor-pointer rounded"
                  title="Copy permanent link to clipboard"
                  id="share-article-btn"
                >
                  Get Link
                </button>
              </>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 border border-transparent hover:bg-black/10 rounded cursor-pointer text-[#141110] ml-1"
              id="close-cross-btn"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Share alert banner */}
        {sharedToast && (
          <div className="absolute top-18 right-6 bg-[#580a0a] text-[#f5eedc] px-4 py-2 text-xs font-mono rounded shadow-lg z-50 animate-bounce">
            Share link copied directly to your clipboard!
          </div>
        )}

        {/* SOLEMN EDITING VIEWPORT */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-6 md:p-10 flex-grow space-y-6 bg-[#f5eedc]" id="editorial-board-edit-form">
            <div className="bg-[#580a0a]/10 border border-[#580a0a]/30 p-4 rounded flex items-start gap-3">
              <ShieldAlert className="text-[#580a0a] mt-0.5 shrink-0" size={18} />
              <div>
                <h3 className="font-serif font-black text-sm text-[#141110] uppercase tracking-wider">Sovereign Revision Console</h3>
                <p className="font-sans text-[11px] text-[#5e5347] mt-1 leading-normal">
                  Your adjustments represent sovereign editorial correction. These modifications immediately sync and update across all broadcast grids.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">Article Title</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-sm focus:outline-none focus:border-[#580a0a] text-[#141110] font-serif text-lg font-bold rounded"
                    placeholder="Headline title..."
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">Subtitle / Deck</label>
                  <input 
                    type="text" 
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-sm focus:outline-none focus:border-[#580a0a] text-[#141110] font-serif italic rounded"
                    placeholder="Secondary deck summary..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">Category Section</label>
                    <select 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as Category)}
                      className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-sm focus:outline-none focus:border-[#580a0a] text-[#141110] rounded font-bold"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">Read Dimension</label>
                    <input 
                      type="text" 
                      value={editReadTime}
                      onChange={(e) => setEditReadTime(e.target.value)}
                      className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-sm focus:outline-none focus:border-[#580a0a] text-[#141110] font-mono rounded"
                      placeholder="e.g. 12 min read"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold font-bold">Illustration Image URL</label>
                  <input 
                    type="text" 
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-xs focus:outline-none focus:border-[#580a0a] text-[#141110] font-mono rounded"
                    placeholder="Image URL link..."
                  />
                </div>

                {/* Switchers */}
                <div className="p-4 bg-[#ebdcb9]/40 border-2 border-[#580a0a]/20 space-y-3 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#141110] uppercase tracking-wider">Current Broadcast Sheet</p>
                      <p className="text-[10px] text-[#5e5347] font-sans">Toggle to push to live Current News or relegate to Archival Ledger.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditIsCurrent(!editIsCurrent)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 focus:outline-none cursor-pointer ${
                        editIsCurrent ? 'bg-[#580a0a]' : 'bg-black/10'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        editIsCurrent ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 pt-3">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#141110] uppercase tracking-wider">Spotlight Front-Page Hero</p>
                      <p className="text-[10px] text-[#5e5347] font-sans">Flag this article with premium double-spread layouts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditIsFeatured(!editIsFeatured)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 focus:outline-none cursor-pointer ${
                        editIsFeatured ? 'bg-[#580a0a]' : 'bg-black/10'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        editIsFeatured ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">Front deck abstract blurb</label>
                  <textarea 
                    rows={2}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-xs focus:outline-none focus:border-[#580a0a] text-[#141110] font-sans rounded"
                    placeholder="Short blurb abstraction..."
                  ></textarea>
                </div>

                <div className="flex-grow flex flex-col">
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase tracking-wider mb-1.5 font-bold">
                    Article Core Content Paragraphs
                  </label>
                  <p className="text-[10px] text-black/50 font-sans mb-1.5 leading-tight">
                    Separate individual print paragraphs by placing double blank carriage-returns (empty blank rows) between paragraphs.
                  </p>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                    className="w-full flex-grow bg-[#fdfbf6] border-2 border-[#580a0a]/30 p-3 text-sm focus:outline-none focus:border-[#580a0a] text-[#141110] font-serif leading-relaxed h-[290px] resize-none rounded"
                    placeholder="Investigative print prose columns..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-6 border-t border-[#580a0a]/20 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#580a0a]/30 bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/85 text-[#141110] font-mono text-xs uppercase cursor-pointer rounded"
              >
                <RotateCcw size={13} />
                Discard Revisions
              </button>

              {onDeleteArticle && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you absolutely sure you want to permanently delete this dispatch ("${article.title}")? This cannot be undone.`)) {
                      onDeleteArticle(article.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-800/30 bg-red-100 hover:bg-red-200 text-red-800 font-mono text-xs uppercase cursor-pointer rounded"
                >
                  <Trash2 size={13} />
                  Delete Dispatch
                </button>
              )}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#580a0a] text-white border border-[#580a0a] hover:bg-[#731212] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg rounded"
              >
                <Save size={13} />
                Authorize Print Copy Changes
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD READ-ONLY VIEWPORT */
          <div className="p-6 md:p-10 flex-grow" id="article-reader-body">
            {/* Metadata Grid */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#580a0a]/25">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 border-2 border-[#580a0a] bg-[#580a0a]/10 text-[#580a0a] rounded uppercase">
                  {article.category}
                </span>
                <span className="text-xs font-mono text-[#5e5347] flex items-center gap-1.5 font-bold">
                  <Clock size={13} className="text-[#580a0a]" />
                  {article.readTime}
                </span>
              </div>

              <div className="text-xs font-mono text-[#5e5347] flex items-center gap-1.5 font-bold">
                <Calendar size={13} className="text-[#580a0a]" />
                <span>Issue Release: {formatDate(article.publishedAt)}</span>
              </div>
            </div>

            {/* Editorial Headings */}
            <div className="my-8 text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-[42px] font-black tracking-tight text-[#141110] leading-tight select-all">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="font-serif italic text-base md:text-lg text-[#5e5347] mt-5 leading-relaxed pl-4 border-l-4 border-[#580a0a] text-left">
                  {article.subtitle}
                </p>
              )}
            </div>

            {/* Social Sharing Broadsheet Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center p-3 border-y-2 border-[#580a0a]/25 font-mono text-[11px] font-bold text-[#5e5347] bg-[#ebdcb9]/15 justify-between gap-3 mb-8">
              <span className="uppercase tracking-wider">Broadside Social Share:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.origin + '?article=' + article.id)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#1da1f2] hover:bg-[#1a91da] text-white px-3 py-1.5 rounded text-[10px] sm:text-xs transition-colors font-bold shadow-sm"
                >
                  <Twitter size={11} />
                  <span>X / Twitter</span>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '?article=' + article.id)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded text-[10px] sm:text-xs transition-colors font-bold shadow-sm"
                >
                  <Facebook size={11} />
                  <span>Facebook</span>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '?article=' + article.id)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#0077b5] hover:bg-[#00669c] text-white px-3 py-1.5 rounded text-[10px] sm:text-xs transition-colors font-bold shadow-sm"
                >
                  <Linkedin size={11} />
                  <span>LinkedIn</span>
                </a>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-[#580a0a] hover:bg-[#731212] text-white px-3 py-1.5 rounded text-[10px] sm:text-xs transition-colors cursor-pointer font-bold shadow-sm"
                >
                  <Share2 size={11} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Two-column layout grid for the article sections on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8" id="article-main-grid">
              {/* Left Column: Writer Profile Sidebar (3 cols out of 12) */}
              <div className="md:col-span-3 space-y-4 md:border-r md:border-[#580a0a]/15 md:pr-6" id="article-writer-column">
                {author || article.authorId === 'w1' || article.authorId === 'w-sameera' ? (
                  <div className="flex flex-row md:flex-col items-center md:items-start text-left space-y-0 md:space-y-3 gap-4 md:gap-0 sticky top-24" id="writer-profile-card">
                    <img 
                      src={author?.avatarUrl || editorAvatar} 
                      alt={author?.name || editorName}
                      className="w-14 h-14 md:w-24 md:h-24 rounded-full object-cover border-2 border-[#580a0a]/30 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = editorAvatar;
                      }}
                    />
                    <div className="flex-grow md:flex-none">
                      <p className="font-mono text-[9px] font-black tracking-widest uppercase text-[#580a0a]">SOVEREIGN REPORTER</p>
                      <p className="font-serif font-bold text-base md:text-lg text-[#141110] mt-1">{author?.name || editorName}</p>
                      <p className="font-mono text-[10px] text-[#5e5347] font-bold">{author?.role || 'Chief Editor'}</p>
                    </div>
                    <p className="hidden md:block font-sans text-xs text-[#5e5347] leading-relaxed border-t border-[#580a0a]/15 pt-3">
                      {author?.bio || editorBio}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-row md:flex-col items-center md:items-start text-left space-y-0 md:space-y-3 gap-4 md:gap-0 sticky top-24" id="staff-profile-card">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-[#ebdcb9]/60 border-2 border-[#580a0a]/30 rounded-full flex items-center justify-center text-[#580a0a] font-serif text-xl md:text-2xl font-black shrink-0">
                      CR
                    </div>
                    <div className="flex-grow md:flex-none">
                      <p className="font-mono text-[9px] text-[#580a0a] tracking-wider uppercase font-bold">STAFF REPORT</p>
                      <p className="font-serif font-bold text-base text-[#141110] mt-1">Ceylon Review Staff</p>
                    </div>
                    <p className="hidden md:block font-sans text-xs text-[#5e5347] leading-normal border-t border-[#580a0a]/15 pt-3">
                      Sourced through verified official channels, constitutional archives, and public interest dispatches.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Article Core Content (9 cols out of 12) */}
              <div className="md:col-span-9 space-y-6" id="article-content-column">
                {/* Large Article Photo */}
                {article.imageUrl && (
                  <div className="border border-[#580a0a]/20 overflow-hidden mb-6 max-h-[400px] shadow rounded" id="article-photo-container">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full object-cover h-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackArticleImage;
                      }}
                    />
                  </div>
                )}

                {/* Article Editorial text columns */}
                <div className="font-sans text-[#141110] text-[16px] md:text-[17px] leading-relaxed space-y-6 select-text" id="article-paragraphs">
                  {article.content.map((paragraph, index) => {
                    // If contains section header like "I. The Colonial Blueprint", render formatted section header instead of standard text block.
                    const isSectionHeader = /^[I|V|X]+\.\s+/.test(paragraph);
                    if (isSectionHeader) {
                      return (
                        <h4 key={index} className="font-sans font-bold text-lg text-[#580a0a] pt-6 pb-2 border-b-2 border-[#580a0a]/15 uppercase tracking-wide">
                          {paragraph}
                        </h4>
                      );
                    }

                    // If paragraph is a blockquote (starts with a quotation mark)
                    if (paragraph.startsWith('“') || paragraph.startsWith('"')) {
                      return (
                        <blockquote key={index} className="border-l-4 border-[#580a0a] pl-5 italic text-[#580a0a] font-serif my-8 text-lg md:text-xl leading-relaxed py-2 bg-[#ebdcb9]/20 pr-4 rounded-r">
                          {paragraph}
                        </blockquote>
                      );
                    }

                    // If legislative timelines
                    if (paragraph.startsWith('LEGISLATIVE TIMELINE:')) {
                      const lines = paragraph.split('\n');
                      return (
                        <div key={index} className="bg-[#141110] text-[#f5eedc] border-l-4 border-[#580a0a] p-5 my-8 font-mono text-xs space-y-2 rounded shadow">
                          {lines.map((line, lidx) => (
                            <div key={lidx} className={lidx === 0 ? "font-bold text-sm tracking-wider uppercase text-white pb-2 border-b border-white/10" : "pl-2 leading-relaxed"}>
                              {line}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Standard drop cap on first paragraph
                    if (index === 0) {
                      return (
                        <p key={index} className="first-letter:text-6xl first-letter:font-sans first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#580a0a] first-letter:leading-none leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    }
                    return (
                      <p key={index} className="text-[#141110] leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Feedback section - likes block */}
                <div className="py-5 border-y border-[#580a0a]/30 flex flex-wrap items-center justify-between gap-4 bg-[#ebdcb9]/40 px-4 rounded" id="feedback-panel">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleLike}
                      disabled={hasLiked}
                      className={`flex items-center gap-2 px-4 py-2 border font-mono text-[11px] font-extrabold uppercase transition-all cursor-pointer rounded ${
                        hasLiked 
                          ? 'bg-[#580a0a] text-white border-[#580a0a]' 
                          : 'bg-[#ebdcb9]/35 hover:bg-[#ebdcb9]/70 text-[#141110] border-[#580a0a]/30'
                      }`}
                      id="recommend-article-btn"
                    >
                      <ThumbsUp size={12} />
                      {hasLiked ? 'Recommended' : 'Recommend this Dispatch'}
                    </button>
                    <span className="font-mono text-xs text-[#5e5347] font-semibold">
                      Recommended by <strong className="text-[#141110] font-black">{article.likes}</strong> citizens
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#5e5347] uppercase font-bold">ISSUE REGULATOR REPORT 2026</p>
                </div>

                {/* Comments block */}
                <div className="mt-12" id="comments-chamber">
                  <h3 className="font-serif font-black text-xl text-[#141110] mb-6 flex items-center gap-2 border-b-2 border-[#580a0a]/20 pb-2 uppercase tracking-wide">
                    <MessageSquare size={18} className="text-[#580a0a]" />
                    Public Commentary Chambers ({article.comments.length})
                  </h3>
                  
                  {/* Submission contact warning */}
                  <div className="bg-[#141110]/5 border-l-4 border-[#580a0a] p-4 text-xs text-[#5e5347] mb-6 leading-relaxed">
                    <span>Are you looking to broadcast original analytical content? Please yield drafts via securely verified <strong>theceylonreview@proton.me</strong> email. Anonymous community inputs below remain open for moderated critique.</span>
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleSubmitComment} className="space-y-4 mb-8 bg-[#ebdcb9]/20 p-5 rounded border border-[#580a0a]/20">
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-[#580a0a]">Add Your Personal Advisory Commentary</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Provide your Name / Call sign..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-[#fdfbf6] border-2 border-[#580a0a]/20 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] font-bold"
                      />
                    </div>
                    <textarea 
                      rows={3}
                      placeholder="Record your respectful feedback on this case analysis..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/20 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] resize-none"
                    ></textarea>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#580a0a] hover:bg-[#731212] text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Send size={11} />
                        Broadside Comment
                      </button>
                    </div>
                  </form>

                  {/* Comments list */}
                  <div className="space-y-4 bg-white/25 rounded p-4 border border-[#580a0a]/10 max-h-[300px] overflow-y-auto">
                    {article.comments.length === 0 ? (
                      <p className="text-center font-serif italic text-[#5e5347]/70 text-xs py-8">"No advisory critical commentary exists on this ledger yet. Be primary observer."</p>
                    ) : (
                      article.comments.map(comment => (
                        <div key={comment.id} className="border-b border-[#580a0a]/10 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-serif font-bold text-xs text-[#141110] block">{comment.author}</span>
                              <span className="font-mono text-[9px] text-[#5e5347] block font-bold">
                                {(() => {
                                  const d = new Date(comment.timestamp);
                                  return isNaN(d.getTime()) ? (comment.timestamp || 'Recently') : d.toLocaleString();
                                })()}
                              </span>
                            </div>
                            {isAdmin && onDeleteComment && (
                              <button 
                                onClick={() => onDeleteComment(article.id, comment.id)}
                                className="bg-red-900/10 hover:bg-red-900/20 text-red-700 font-mono text-[9px] font-bold px-2 py-0.5 border border-red-900/20 rounded cursor-pointer transition-all"
                                title="Direct administrative override deletion"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="font-sans text-xs text-[#141110]/85 mt-1.5 leading-relaxed bg-[#fdfbf6]/50 p-2 border border-[#580a0a]/5 rounded-sm">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
