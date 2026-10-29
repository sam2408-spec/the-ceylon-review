import React, { useState } from 'react';
import { Article, Writer, Category } from '../types';
import { Mail, MapPin, Feather, PlusCircle, CheckCircle, User, ArrowRight, NotebookPen, Tag, Upload, Camera, Edit3, Check, X, Globe } from 'lucide-react';

interface WriterProfileViewProps {
  writers: Writer[];
  articles: Article[];
  onAddNewArticle: (newArticle: Omit<Article, 'id' | 'likes' | 'views' | 'comments'>) => void;
  onReadArticle: (article: Article) => void;
  onAddNewWriter: (newWriter: Writer) => void;
  onUpdateWriter: (writerId: string, updatedFields: Partial<Writer>) => void;
  isAdmin: boolean;
}

export default function WriterProfileView({
  writers,
  articles,
  onAddNewArticle,
  onReadArticle,
  onAddNewWriter,
  onUpdateWriter,
  isAdmin
}: WriterProfileViewProps) {
  const [selectedWriterId, setSelectedWriterId] = useState<string>(writers[0]?.id || '');
  const [isComposing, setIsComposing] = useState(false);
  const [isAddingWriter, setIsAddingWriter] = useState(false);

  // New Article Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [contentRaw, setContentRaw] = useState('');
  const [category, setCategory] = useState<Category>('Politics'); 
  const [imageKeyword, setImageKeyword] = useState('news');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // New Writer Form state
  const [writerName, setWriterName] = useState('');
  const [writerRole, setWriterRole] = useState('');
  const [writerBio, setWriterBio] = useState('');
  const [writerEmail, setWriterEmail] = useState('');
  const [writerTwitter, setWriterTwitter] = useState('');
  const [writerLocation, setWriterLocation] = useState('');
  const [writerSuccess, setWriterSuccess] = useState(false);

  // Custom Portrait states
  const [writerAvatar, setWriterAvatar] = useState<string>(''); // custom base64 avatar
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);

  // Edit selected profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isDragOverEditAvatar, setIsDragOverEditAvatar] = useState(false);

  const categoryOptions: Category[] = ['Politics', 'Tech', 'Science', 'Opinion', 'Culture', 'Business'];

  const selectedWriter = writers.find(w => w.id === selectedWriterId);
  const writerArticles = articles.filter(art => art.authorId === selectedWriterId);

  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentRaw.trim() || !selectedWriterId) return;

    // Split paragraphs by double linebreaks or blank lines
    const paragraphs = contentRaw
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const imageUrl = `https://images.unsplash.com/photo-${getUnsplashIdByKeyword(imageKeyword)}?auto=format&fit=crop&q=80&w=800&h=450`;

    onAddNewArticle({
      title: title.trim(),
      subtitle: subtitle.trim() || 'An independent Ceylon Review investigation.',
      summary: summary.trim() || (paragraphs[0]?.substring(0, 150) + '...'),
      content: paragraphs,
      authorId: selectedWriterId,
      publishedAt: new Date().toISOString().split('T')[0],
      category: category,
      imageUrl: imageUrl,
      readTime: `${readTimeMinutes} min read`,
      isCurrent: true,
    });

    // Reset Form State
    setTitle('');
    setSubtitle('');
    setSummary('');
    setContentRaw('');
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setIsComposing(false);
    }, 2800);
  };

  const handleFileChange = (file: File, target: 'new' | 'edit') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'new') {
        setWriterAvatar(base64String);
      } else {
        setEditAvatar(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateWriter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerName.trim() || !writerRole.trim()) return;

    const writerId = `w-${Date.now()}`;
    const avatarUrl = writerAvatar || `https://images.unsplash.com/photo-${getRandomPortraitId()}?auto=format&fit=crop&q=80&w=400&h=400`;

    onAddNewWriter({
      id: writerId,
      name: writerName.trim(),
      role: writerRole.trim(),
      bio: writerBio.trim() || 'Contributor reporting on regional affairs, political dynamics, and Ceylonese community history.',
      avatarUrl: avatarUrl,
      email: writerEmail.trim() || `${writerName.toLowerCase().replace(/\s+/g, '.')}@ceylon-review.com`,
      twitter: writerTwitter.trim() || `@${writerName.toLowerCase().replace(/\s+/g, '')}`,
      location: writerLocation.trim() || 'Colombo Newsroom',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    setWriterName('');
    setWriterRole('');
    setWriterBio('');
    setWriterEmail('');
    setWriterTwitter('');
    setWriterLocation('');
    setWriterAvatar('');
    
    setWriterSuccess(true);
    setSelectedWriterId(writerId);
    setTimeout(() => {
      setWriterSuccess(false);
      setIsAddingWriter(false);
    }, 2500);
  };

  const startEditingProfile = () => {
    if (!selectedWriter) return;
    setEditName(selectedWriter.name);
    setEditRole(selectedWriter.role);
    setEditBio(selectedWriter.bio);
    setEditEmail(selectedWriter.email);
    setEditTwitter(selectedWriter.twitter);
    setEditLocation(selectedWriter.location);
    setEditAvatar(selectedWriter.avatarUrl);
    setIsEditingProfile(true);
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWriter) return;
    onUpdateWriter(selectedWriter.id, {
      name: editName.trim(),
      role: editRole.trim(),
      bio: editBio.trim(),
      email: editEmail.trim(),
      twitter: editTwitter.trim(),
      location: editLocation.trim(),
      avatarUrl: editAvatar
    });
    setIsEditingProfile(false);
  };

  const getUnsplashIdByKeyword = (kw: string) => {
    const term = kw.toLowerCase().trim();
    if (term.includes('space') || term.includes('science')) return '1451187580459-43490279c0fa';
    if (term.includes('politic') || term.includes('government')) return '1541872703-74c5e44368f9';
    if (term.includes('nature') || term.includes('wetland') || term.includes('river') || term.includes('ceylon') || term.includes('sri lanka')) return '1546708973-b339540b5162';
    if (term.includes('code') || term.includes('tech') || term.includes('computer')) return '1518770660439-4636190af475';
    if (term.includes('money') || term.includes('business') || term.includes('market')) return '1559526324-4b87b5e36e44';
    if (term.includes('art') || term.includes('culture') || term.includes('music')) return '1459749411175-04bf5292ceea';
    if (term.includes('food') || term.includes('tea')) return '1576092768241-dec231879fc3';
    return '1486312338219-ce68d2c6f44d'; 
  };

  const getRandomPortraitId = () => {
    const list = [
      '1534528741775-53994a69daeb', 
      '1507003211169-0a1dd7228f2d', 
      '1494790108377-be9c29b29330', 
      '1500648767791-00dcc994a43e', 
      '1539571696357-5a69c17a67c6', 
    ];
    return list[Math.floor(Math.random() * list.length)];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="writer-portal-page">
      {/* Overview Header */}
      <div className="border-b-2 border-[#580a0a] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-black text-[#141110] tracking-tight uppercase">The Ceylon Writers' Guild</h2>
          <p className="font-sans text-xs sm:text-sm text-[#5e5347] mt-1.5 font-medium">
            Meet our independent columnists, research correspondents, and local truth-seekers, or file analytical drafts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setIsComposing(!isComposing);
                  setIsAddingWriter(false);
                }}
                className="flex items-center gap-1.5 bg-[#580a0a] hover:bg-[#731212] text-white px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded shadow"
                id="toggle-compose-btn"
              >
                <NotebookPen size={13} />
                {isComposing ? 'Close Newsroom' : 'File New Coverage'}
              </button>

              <button
                onClick={() => {
                  setIsAddingWriter(!isAddingWriter);
                  setIsComposing(false);
                }}
                className="flex items-center gap-1.5 border-2 border-[#580a0a]/30 hover:bg-[#ebdcb9]/80 bg-[#ebdcb9]/40 text-[#141110] px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded shadow"
                id="toggle-add-reporter-btn"
              >
                <User size={13} />
                {isAddingWriter ? 'Close Registry' : 'Accredit Contributor'}
              </button>
            </>
          ) : (
            <div className="bg-[#141110]/5 border-2 border-dashed border-[#580a0a]/20 text-[#5e5347] p-2 px-3 rounded text-[10px] sm:text-xs font-mono max-w-sm font-semibold">
              <span>Looking to write? Submissions locked. Toggle <strong>Editor Access</strong> and enter key to submit columns.</span>
            </div>
          )}
        </div>
      </div>

      {/* Slide-downs for notifications */}
      {publishSuccess && (
        <div className="bg-[#580a0a]/10 text-[#580a0a] border-2 border-[#580a0a]/30 p-4 mb-6 font-mono text-xs font-bold rounded flex items-center gap-2 animate-pulse">
          <CheckCircle size={16} className="text-[#580a0a]" />
          SUCCESS: Exclusive Article has been filed, typeset, and dynamically added to current Ceylon Review issues!
        </div>
      )}

      {writerSuccess && (
        <div className="bg-[#580a0a]/10 text-[#580a0a] border-2 border-[#580a0a]/30 p-4 mb-6 font-mono text-xs font-bold rounded flex items-center gap-2 animate-pulse">
          <CheckCircle size={16} className="text-[#580a0a]" />
          SUCCESS: Contributor record verified. Dynamic credential emails registered and attached to masthead database.
        </div>
      )}

      {/* COMPOSING SUBMISSION FORM */}
      {isComposing && isAdmin && (
        <div className="bg-paper-card border-2 border-[#580a0a] p-6 mb-10 shadow rounded animate-in slide-in-from-top duration-350" id="compose-container">
          <h3 className="font-serif text-lg font-black border-b border-[#580a0a]/20 pb-3 mb-6 flex items-center gap-2 text-[#141110] uppercase">
            <Feather size={16} className="text-[#580a0a]" />
            File Exclusive Live Coverage
          </h3>

          <form onSubmit={handlePublishArticle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="author-select">Correspondent Byline</label>
                <select
                  id="author-select"
                  value={selectedWriterId}
                  onChange={(e) => setSelectedWriterId(e.target.value)}
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold"
                  required
                >
                  <option value="">-- Choose Assigned Contributor --</option>
                  {writers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="article-title">Headline</label>
                <input
                  type="text"
                  id="article-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Headline..."
                  required
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-serif font-bold text-lg"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="article-subtitle">Sub-Headline / Deck</label>
                <input
                  type="text"
                  id="article-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Secondary abstract..."
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-serif italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="article-category">News Column</label>
                  <select
                    id="article-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold"
                    required
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5" htmlFor="article-readtime">Estimated Read Time</label>
                  <input
                    type="number"
                    id="article-readtime"
                    min={1}
                    max={30}
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(parseInt(e.target.value))}
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="image-keywords-input">
                  Illustrative Image Theme (Keyword)
                </label>
                <input
                  type="text"
                  id="image-keywords-input"
                  value={imageKeyword}
                  onChange={(e) => setImageKeyword(e.target.value)}
                  placeholder="Filter: politics, science, tea, ceylon, coffee, war"
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none font-mono text-xs rounded"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="flex-grow flex flex-col mb-4">
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="article-paragraphs-area">
                  Coverage Narrative (Double Enter to separate paragraphs)
                </label>
                <textarea
                  id="article-paragraphs-area"
                  rows={9}
                  required
                  value={contentRaw}
                  onChange={(e) => setContentRaw(e.target.value)}
                  placeholder="Narrative prose..."
                  className="w-full flex-grow bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-3 text-sm focus:border-[#580a0a] focus:outline-none font-serif leading-relaxed h-[220px] rounded"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 border-2 border-[#580a0a]/30 text-[#141110] bg-[#ebdcb9]/30 hover:bg-[#ebdcb9]/60 font-mono text-xs uppercase cursor-pointer rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#580a0a] text-white hover:bg-[#731212] font-mono text-xs font-bold uppercase cursor-pointer rounded shadow"
                  id="publish-submission-btn"
                >
                  Dispatch to Press
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ACCREDIT REPORTER FORM */}
      {isAddingWriter && isAdmin && (
        <div className="bg-paper-card border-2 border-[#580a0a] p-6 mb-10 shadow rounded animate-in slide-in-from-top duration-350" id="add-writer-sandbox">
          <h3 className="font-serif text-lg font-black border-b border-[#580a0a]/20 pb-3 mb-6 flex items-center gap-2 text-[#141110] uppercase">
            <PlusCircle size={16} className="text-[#580a0a]" />
            Accredit New Correspondent Credentials
          </h3>

          <form onSubmit={handleCreateWriter} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="reg-name">Correspondent Name</label>
                <input
                  type="text"
                  id="reg-name"
                  value={writerName}
                  onChange={(e) => setWriterName(e.target.value)}
                  placeholder="E.g., Sameera Mahboobdeen"
                  required
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5 font-black" htmlFor="reg-role">Editorial Beat / Specialization</label>
                <input
                  type="text"
                  id="reg-role"
                  value={writerRole}
                  onChange={(e) => setWriterRole(e.target.value)}
                  placeholder="E.g., Senior Legal Correspondent"
                  required
                  className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5" htmlFor="reg-loc">Location Hub</label>
                  <input
                    type="text"
                    id="reg-loc"
                    value={writerLocation}
                    onChange={(e) => setWriterLocation(e.target.value)}
                    placeholder="E.g., Colombo, Sri Lanka"
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5" htmlFor="reg-tw">Social Handle</label>
                  <input
                    type="text"
                    id="reg-tw"
                    value={writerTwitter}
                    onChange={(e) => setWriterTwitter(e.target.value)}
                    placeholder="@sameera_reports"
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded"
                  />
                </div>
              </div>

              {/* Correspondent Portrait Upload */}
              <div className="border-2 border-[#580a0a]/15 p-4 bg-[#ebdcb9]/15 rounded">
                <span className="block font-mono text-[10px] text-[#5e5347] uppercase mb-2 font-black">
                  Correspondent Photo / Portrait
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Circle Preview */}
                  <div className="w-16 h-16 rounded-full border-2 border-[#580a0a] bg-[#ebdcb9]/20 overflow-hidden shrink-0 flex items-center justify-center">
                    {writerAvatar ? (
                      <img 
                        src={writerAvatar} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover animate-fade-in" 
                      />
                    ) : (
                      <User size={24} className="text-[#580a0a]/40" />
                    )}
                  </div>

                  {/* Drag-and-drop Dropzone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOverAvatar(true); }}
                    onDragLeave={() => setIsDragOverAvatar(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverAvatar(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileChange(e.dataTransfer.files[0], 'new');
                      }
                    }}
                    className={`flex-grow w-full border-2 border-dashed rounded p-3 text-center transition-all cursor-pointer ${
                      isDragOverAvatar
                        ? 'border-[#580a0a] bg-[#580a0a]/5'
                        : 'border-[#580a0a]/20 hover:border-[#580a0a]/50 hover:bg-[#ebdcb9]/10 py-4'
                    }`}
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                  >
                    <Upload size={14} className="mx-auto text-[#580a0a] mb-1" />
                    <span className="block text-[9px] font-mono uppercase text-[#5e5347] font-black">
                      {isDragOverAvatar ? 'Drop File Here' : 'Drag profile picture or click'}
                    </span>
                    <input
                      type="file"
                      id="avatar-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0], 'new');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Preset library fallback */}
                <div className="mt-4 border-t border-[#580a0a]/10 pt-3">
                  <span className="block text-[8px] font-mono text-[#5e5347]/80 uppercase mb-2 font-black">
                    Or select pre-set editorial portraits:
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
                    {[
                      { name: 'Sameera', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
                      { name: 'Archival M', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
                      { name: 'Expert F', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
                      { name: 'Reporter M', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
                      { name: 'Analyst F', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWriterAvatar(preset.url)}
                        className={`flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-[#ebdcb9]/40 border-2 rounded transition-all shrink-0 ${
                          writerAvatar === preset.url ? 'border-[#580a0a] bg-[#ebdcb9]/30 scale-[1.03]' : 'border-[#580a0a]/15'
                        }`}
                        title={`Select Preset: ${preset.name}`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[8px] font-mono font-bold text-[#5e5347]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5" htmlFor="reg-email">Newsroom Email</label>
                  <input
                    type="email"
                    id="reg-email"
                    value={writerEmail}
                    onChange={(e) => setWriterEmail(e.target.value)}
                    placeholder="s.mahboobdeen@ceylon-review.com"
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#5e5347] uppercase mb-1.5" htmlFor="reg-bio">Journalist Biography</label>
                  <textarea
                    id="reg-bio"
                    rows={4}
                    value={writerBio}
                    onChange={(e) => setWriterBio(e.target.value)}
                    placeholder="E.g., Investigative historian focusing on Indian Ocean shipping lines and Ceylon trade jurisprudence."
                    className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded resize-y"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-right pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingWriter(false)}
                  className="px-4 py-2 border-2 border-[#580a0a]/30 text-[#141110] bg-[#ebdcb9]/30 hover:bg-[#ebdcb9]/60 font-mono text-xs uppercase cursor-pointer rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#580a0a] text-white hover:bg-[#731212] font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded shadow border-2 border-[#580a0a]"
                  id="submit-writer-btn"
                >
                  Commission Correspondent
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CORE GRID: LEFT WRITER DIRECOTRY, RIGHT DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="journalists-grid-split">
        {/* LEFT COLUMN: Contributor list */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-mono text-[10px] font-black text-[#5e5347] uppercase tracking-widest border-b border-[#580a0a]/25 pb-2 mb-4">
            Masthead Directory
          </h3>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-3 lg:pb-0" id="reporters-badges-horizontal">
            {writers.length === 0 ? (
              <div className="w-full bg-[#ebdcb9]/15 border-2 border-dashed border-[#580a0a]/20 p-5 text-center rounded font-serif italic text-xs text-[#5e5347] leading-relaxed">
                No accredited correspondents currently registered under the Ceylon Review guild.
                {isAdmin ? (
                  <p className="mt-2 font-mono text-[9px] not-italic font-bold uppercase text-[#580a0a]">
                    Click "Accredit Contributor" above to commission new reporters.
                  </p>
                ) : (
                  <p className="mt-2 font-mono text-[9px] not-italic font-bold uppercase text-[#580a0a]">
                    Toggle Sovereign Desk Authorization to register profiles.
                  </p>
                )}
              </div>
            ) : (
              writers.map((writer) => {
                const isSelected = writer.id === selectedWriterId;
                const writtenCount = articles.filter(a => a.authorId === writer.id).length;
                return (
                  <button
                    key={writer.id}
                    onClick={() => setSelectedWriterId(writer.id)}
                    className={`
                      w-64 lg:w-full flex items-center gap-3.5 p-3.5 border-2 text-left cursor-pointer transition-all duration-200 shrink-0 select-none rounded`
                      + (isSelected 
                        ? ' bg-[#580a0a] text-white border-[#580a0a] shadow-md font-bold' 
                        : ' bg-paper-card text-[#141110] border-[#580a0a]/20 hover:bg-[#ebdcb9]/40 hover:border-[#580a0a]/40'
                      )
                    }
                    id={`mast-reporter-btn-${writer.id}`}
                  >
                    <img 
                      src={writer.avatarUrl} 
                      alt={writer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white bg-white shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-serif font-black text-sm sm:text-base leading-tight truncate">{writer.name}</h4>
                      <p className={`font-mono text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#5e5347]'}`}>
                        {writer.role}
                      </p>
                      <p className={`font-sans text-[10px] mt-1.5 font-black uppercase tracking-wider ${isSelected ? 'text-white/90 underline' : 'text-[#580a0a]'}`}>
                        {writtenCount} Column{writtenCount === 1 ? '' : 's'} Filed
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Profile details */}
        <div className="lg:col-span-8">
          {selectedWriter ? (
            <div className="bg-paper-card border-2 border-[#580a0a]/35 p-6 md:p-8 relative shadow rounded" id="writer-details-view">
              {/* Header Badge & Edit Triggers */}
              <div className="absolute top-0 right-0 flex items-center bg-[#ebdcb9] select-none border-b border-l border-[#580a0a]/25 text-[#141110]">
                {isAdmin && !isEditingProfile && (
                  <button
                    onClick={startEditingProfile}
                    className="flex items-center gap-1.5 font-mono text-[9px] font-black px-3 py-1.5 uppercase hover:bg-[#ebdcb9]/60 border-r border-[#580a0a]/15 text-[#580a0a] transition-colors cursor-pointer"
                    title="Edit writer profile details manually"
                  >
                    <Edit3 size={10} />
                    Edit Profile
                  </button>
                )}
                <div className="font-mono text-[9px] font-black px-3 py-1.5 uppercase">
                  Staff Profile
                </div>
              </div>

              {isEditingProfile && isAdmin ? (
                /* MANUAL PROFILE EDITOR VIEW */
                <form onSubmit={handleSaveProfileEdit} className="space-y-6 pt-4">
                  <div className="border-b-2 border-dashed border-[#580a0a]/15 pb-4 mb-4">
                    <h4 className="font-serif text-base font-black text-[#141110] uppercase flex items-center gap-1.5">
                      <Edit3 size={14} className="text-[#580a0a]" />
                      Modify Correspondent Profile Record
                    </h4>
                    <p className="font-sans text-[10px] text-[#5e5347]/80 mt-1">
                      Manually adjust biography, credential details, and photo registry for {selectedWriter.name}.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Interactive Profile Picture Uploader for Editing */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOverEditAvatar(true); }}
                        onDragLeave={() => setIsDragOverEditAvatar(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOverEditAvatar(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileChange(e.dataTransfer.files[0], 'edit');
                          }
                        }}
                        className={`w-24 h-24 rounded-full border-2 overflow-hidden relative group transition-all shrink-0 ${
                          isDragOverEditAvatar ? 'border-[#580a0a] scale-105 shadow-md bg-[#580a0a]/5' : 'border-[#580a0a]/25 bg-[#ebdcb9]/10'
                        }`}
                      >
                        {editAvatar ? (
                          <img 
                            src={editAvatar} 
                            alt="Avatar preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User size={32} className="text-[#580a0a]/30 absolute inset-0 m-auto" />
                        )}
                        <div 
                          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1"
                          onClick={() => document.getElementById('edit-avatar-file-input')?.click()}
                        >
                          <Camera size={16} className="text-white animate-pulse" />
                          <span className="text-[7px] font-mono text-white/90 uppercase tracking-wider mt-1">Upload Photo</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => document.getElementById('edit-avatar-file-input')?.click()}
                        className="text-[10px] font-mono uppercase font-black text-[#580a0a] hover:underline"
                      >
                        Upload custom
                      </button>
                      <input
                        type="file"
                        id="edit-avatar-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(e.target.files[0], 'edit');
                          }
                        }}
                      />
                    </div>

                    <div className="flex-grow space-y-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1 font-black">Full Name</label>
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold" 
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1 font-black">Editorial Beat / Specialization</label>
                          <input 
                            type="text" 
                            value={editRole} 
                            onChange={(e) => setEditRole(e.target.value)}
                            required
                            className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2 text-sm focus:border-[#580a0a] focus:outline-none rounded font-bold" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1">Newsroom Email</label>
                          <input 
                            type="email" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/20 p-2 text-xs focus:border-[#580a0a] focus:outline-none rounded" 
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1">Location Hub</label>
                          <input 
                            type="text" 
                            value={editLocation} 
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/20 p-2 text-xs focus:border-[#580a0a] focus:outline-none rounded" 
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1">Social Handle</label>
                          <input 
                            type="text" 
                            value={editTwitter} 
                            onChange={(e) => setEditTwitter(e.target.value)}
                            className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/20 p-2 text-xs focus:border-[#580a0a] focus:outline-none rounded" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] text-[#5e5347] uppercase mb-1.5 font-black">Journalist Biography</label>
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[#fdfbf6] text-[#141110] border-2 border-[#580a0a]/25 p-2.5 text-sm focus:border-[#580a0a] focus:outline-none rounded resize-y" 
                    />
                  </div>

                  {/* Preset library fallback for editing */}
                  <div className="border-t border-[#580a0a]/10 pt-4">
                    <span className="block text-[8px] font-mono text-[#5e5347]/85 uppercase mb-2 font-black">
                      Or select from editorial placeholder portraits:
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
                      {[
                        { name: 'Sameera', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
                        { name: 'Archival M', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
                        { name: 'Expert F', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
                        { name: 'Reporter M', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
                        { name: 'Analyst F', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(preset.url)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#ebdcb9]/40 border-2 rounded transition-all shrink-0 ${
                            editAvatar === preset.url ? 'border-[#580a0a] bg-[#ebdcb9]/30 scale-[1.03]' : 'border-[#580a0a]/15'
                          }`}
                        >
                          <img src={preset.url} alt={idx.toString()} className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-mono text-[8.5px] font-bold text-[#5e5347]">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-[#580a0a]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border-2 border-[#580a0a]/30 text-[#141110] bg-[#ebdcb9]/30 hover:bg-[#ebdcb9]/60 font-mono text-xs uppercase rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#580a0a] text-white hover:bg-[#731212] font-mono text-xs font-bold uppercase rounded cursor-pointer flex items-center gap-1 border-2 border-[#580a0a]"
                    >
                      <Check size={12} /> Save Manually
                    </button>
                  </div>
                </form>
              ) : (
                /* REGULAR CORRESPONDENT DETAIL VIEW */
                <>
                  {/* Identity view */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#580a0a]/15 pb-6 mb-6">
                    <img 
                      src={selectedWriter.avatarUrl} 
                      alt={selectedWriter.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#580a0a]/25 shadow-sm shrink-0 bg-white"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400';
                      }}
                    />
                    <div className="text-center sm:text-left space-y-1.5 flex-grow">
                      <h3 className="font-serif text-2xl md:text-3xl font-black text-[#141110] leading-tight select-all">{selectedWriter.name}</h3>
                      <p className="font-mono text-xs font-black text-[#580a0a] tracking-widest uppercase">{selectedWriter.role}</p>
                      
                      {/* Contact Indicators */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 pt-2.5 text-xs font-mono text-[#5e5347] font-bold">
                        <a href={`mailto:${selectedWriter.email}`} className="flex items-center gap-1 hover:text-[#580a0a] hover:underline">
                          <Mail size={12} className="text-[#580a0a]" />
                          {selectedWriter.email}
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1" title="Correspondent Location">
                          <MapPin size={12} className="text-[#580a0a]" />
                          {selectedWriter.location}
                        </span>
                        <span>•</span>
                        <span className="text-[#5e5347]/80">Joined: {selectedWriter.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="mb-8 max-w-2xl bg-[#ebdcb9]/20 p-4 border-l-4 border-[#580a0a] rounded-r">
                    <h4 className="font-mono text-[9px] text-[#5e5347] tracking-widest uppercase mb-2 font-black">Correspondent Bio</h4>
                    <p className="font-sans text-sm md:text-base text-[#141110] leading-relaxed italic select-all">
                      "{selectedWriter.bio}"
                    </p>
                  </div>

                  {/* Portfolio columns list */}
                  <div>
                    <h4 className="font-mono text-[10px] font-black text-[#5e5347] tracking-widest uppercase border-b border-[#580a0a]/20 pb-2 mb-4 flex justify-between">
                      <span>Author Dispatch Index ({writerArticles.length})</span>
                      <span>THE CEYLON REVIEW PRINT REPRODUCTIONS</span>
                    </h4>

                    <div className="space-y-4">
                      {writerArticles.length === 0 ? (
                        <div className="border border-dashed border-[#580a0a]/30 px-4 py-8 text-center text-sm italic text-[#5e5347] rounded font-serif">
                          This journalist has not dispatched any articles to the Ceylon Review feeds yet.
                        </div>
                      ) : (
                        writerArticles.map((art) => (
                          <div 
                            key={art.id}
                            onClick={() => onReadArticle(art)}
                            className="group border border-[#580a0a]/20 p-4 bg-[#fdfbf6] hover:bg-[#ebdcb9]/25 transition-colors duration-150 cursor-pointer rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            id={`portfolio-item-${art.id}`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[9px] font-mono uppercase bg-[#ebdcb9]/40 group-hover:bg-[#ebdcb9]/80 text-[#580a0a] font-bold px-1.5 py-0.2 border border-[#580a0a]/20 transition-colors rounded">
                                  {art.category}
                                </span>
                                <span className="font-mono text-[10px] opacity-75 text-[#5e5347] font-bold">{art.publishedAt}</span>
                              </div>
                              <h5 className="font-serif font-bold text-base text-[#141110] group-hover:text-[#580a0a] transition-colors">
                                {art.title}
                              </h5>
                              <p className="font-sans text-xs text-[#5e5347] mt-1 line-clamp-1">
                                {art.summary}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 font-mono text-[11px] font-bold text-[#580a0a] group-hover:underline">
                              <span>Read Article</span>
                              <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#580a0a]/35 p-12 text-center text-[#5e5347] rounded font-serif italic">
              Please select or commission a correspondent from the masthead column to view their active portfolios.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
