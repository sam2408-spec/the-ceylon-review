import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Calendar, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Play, 
  X, 
  ExternalLink, 
  Film, 
  Sparkles, 
  Link as LinkIcon, 
  FileVideo, 
  Eye,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { subscribeToEvents, saveEventToFirestore, deleteEventFromFirestore } from '../firebase';
import { compressImage } from '../utils/image';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  platform: 'YouTube' | 'Vimeo' | 'Other';
  publishedAt: string;
  likes: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
}

// Photos uploaded together share an id like evt-<time>-<n>; they are shown as one set.
const SET_ID_RE = /^evt-(\d+)-(\d+)$/;
const SUFFIX_RE = /\s*\(\d+ of \d+\)\s*$/;
interface EventSet { key: string; title: string; items: EventItem[]; }
function groupIntoSets(list: EventItem[]): EventSet[] {
  const order: string[] = [];
  const map = new Map<string, EventItem[]>();
  for (const ev of list) {
    const m = SET_ID_RE.exec(ev.id);
    const key = m ? `set-${m[1]}` : ev.id;
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key)!.push(ev);
  }
  return order.map((key) => {
    const items = map.get(key)!.slice().sort((a, b) => {
      const ia = Number(SET_ID_RE.exec(a.id)?.[2] ?? 0);
      const ib = Number(SET_ID_RE.exec(b.id)?.[2] ?? 0);
      return ia - ib;
    });
    return { key, title: items[0].title.replace(SUFFIX_RE, ''), items };
  });
}

interface MediaHubProps {
  isAdmin: boolean;
}

// Initial seed data for Curated Video Dispatches
const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-rowlatt',
    title: 'The Rowlatt Act & Postcolonial Continuities in South Asia',
    description: 'An educational briefing tracking the direct historical evolution of the Defence of India Act 1915 into the current Prevention of Terrorism legislation of Sri Lanka.',
    videoUrl: 'https://www.youtube.com/watch?v=kYIP3y5dO-M',
    platform: 'YouTube',
    publishedAt: 'June 28, 2026',
    likes: 42
  },
  {
    id: 'vid-press-freedom',
    title: 'Defending Confidential Sources in Digital Spaces',
    description: 'Chief Editor Sameera Mahboobdeen addresses the Colombo Press Union on digital metadata footprints, Signal encryption, and legislative loopholes.',
    videoUrl: 'https://www.youtube.com/watch?v=s5R-t6tZfG4',
    platform: 'YouTube',
    publishedAt: 'June 19, 2026',
    likes: 29
  },
  {
    id: 'vid-constitutional',
    title: 'Section 14(1)(a) & Administrative Censorship',
    description: 'A panel discussion on constitutional safeguards, the role of public interest litigation, and resistance against unconstitutional licensing acts.',
    videoUrl: 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
    platform: 'YouTube',
    publishedAt: 'May 30, 2026',
    likes: 56
  }
];

// Initial seed data for Event Gallery
const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-council',
    title: 'Sovereign Press Council Inaugural Assembly',
    description: 'The primary drafting council of editors, lawyers, and civil society representatives meets at the Colombo Library to ratify the Ceylon Press Code of Conduct.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800',
    date: 'June 12, 2026',
    location: 'Colombo Public Library Assembly Hall'
  },
  {
    id: 'evt-seminar',
    title: 'Cryptographic Protection Seminar for Local Freelancers',
    description: 'A hands-on workshop guiding independent reporters on configuring DNS-over-HTTPS, virtual machines, and secure drop boxes.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    date: 'June 18, 2026',
    location: 'Galle Face Green Press Chambers'
  },
  {
    id: 'evt-retreat',
    title: 'Annual General Retreat & Investigative Syndicate Meet',
    description: 'Ceylon Review editorial teams convene to review long-form national security archives, regional power-grid analysis, and draft schedules.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    date: 'June 24, 2026',
    location: 'Kandy Botanical Forest Sanctuary'
  }
];

export default function MediaHub({ isAdmin }: MediaHubProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<'videos' | 'events'>('videos');
  
  // Persistent state for Videos & Gallery Events
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('ceylon_review_videos_v2');
    if (saved) {
      try {
        const parsed: VideoItem[] = JSON.parse(saved);
        // Sanitize any legacy placeholder video links
        return parsed.map(v => {
          if (v.videoUrl.includes('dQw4w9WgXcQ')) {
            const defMatch = DEFAULT_VIDEOS.find(dv => dv.id === v.id);
            return defMatch || v;
          }
          return v;
        });
      } catch (e) {
        console.error('Failed to parse videos, using defaults.', e);
      }
    }
    return DEFAULT_VIDEOS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('ceylon_review_events_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse events, using defaults.', e);
      }
    }
    return DEFAULT_EVENTS;
  });

  // Shared gallery stored online (visible to all readers). Sample entries show only until the first real one is added.
  const [cloudEvents, setCloudEvents] = useState<EventItem[]>([]);
  const [eventFiles, setEventFiles] = useState<{ name: string; data: string }[]>([]);
  const [eventBusy, setEventBusy] = useState(false);
  const [eventError, setEventError] = useState('');

  useEffect(() => {
    const unsub = subscribeToEvents((list) => setCloudEvents(list as EventItem[]));
    return () => unsub();
  }, []);

  const shownEvents = cloudEvents.length > 0 ? cloudEvents : events;
  const sets = groupIntoSets(shownEvents);

  // Lightbox Modal for Gallery Events
  const [activeSetKey, setActiveSetKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);
  const activeSet = sets.find((x) => x.key === activeSetKey) || null;
  const activeLightboxImage: EventItem | null = activeSet ? activeSet.items[Math.min(activeIndex, activeSet.items.length - 1)] : null;
  const setActiveLightboxImage = (_: null) => setActiveSetKey(null);
  const openSet = (key: string) => { setActiveIndex(0); setActiveSetKey(key); };
  const stepSet = (d: number) => {
    if (!activeSet) return;
    const n = activeSet.items.length;
    setActiveIndex((i) => (i + d + n) % n);
  };

  // Keyboard Escape & Scroll Lock for Lightbox
  useEffect(() => {
    if (!activeLightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxImage(null);
      } else if (e.key === 'ArrowRight') {
        stepSet(1);
      } else if (e.key === 'ArrowLeft') {
        stepSet(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeSetKey, activeSet?.items.length]);

  // Forms Toggle State
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  // Video Form Input Fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPlatform, setVideoPlatform] = useState<'YouTube' | 'Vimeo' | 'Other'>('YouTube');

  // Event Form Input Fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImageInput, setEventImageInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Status Alerts
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ceylon_review_videos_v2', JSON.stringify(videos));
    } catch (e) {
      console.warn('Could not save videos to localStorage', e);
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem('ceylon_review_events_v2', JSON.stringify(events));
    } catch (e) {
      console.warn('Could not save events to localStorage', e);
    }
  }, [events]);

  // Video embed generator
  const getEmbedUrl = (url: string, platform: 'YouTube' | 'Vimeo' | 'Other') => {
    if (!url) return null;
    
    // YouTube
    if (platform === 'YouTube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        // Fallback or straight ID
        videoId = url.trim().slice(-11);
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (platform === 'Vimeo' || url.includes('vimeo.com')) {
      const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    
    return null;
  };

  // Likes Interaction
  const handleLikeVideo = (id: string) => {
    setVideos(prev => 
      prev.map(v => v.id === id ? { ...v, likes: v.likes + 1 } : v)
    );
  };

  // Video Submission Handler
  const handlePostVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrlInput.trim()) return;

    // Detect platform based on input
    let platformType = videoPlatform;
    if (videoUrlInput.includes('youtube.com') || videoUrlInput.includes('youtu.be')) {
      platformType = 'YouTube';
    } else if (videoUrlInput.includes('vimeo.com')) {
      platformType = 'Vimeo';
    }

    const newVideo: VideoItem = {
      id: `vid-${Date.now()}`,
      title: videoTitle,
      description: videoDesc || 'Curated broadcast dispatch by Ceylon Review reporters.',
      videoUrl: videoUrlInput,
      platform: platformType,
      publishedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      likes: 0
    };

    setVideos([newVideo, ...videos]);
    
    // Reset Form
    setVideoTitle('');
    setVideoDesc('');
    setVideoUrlInput('');
    setVideoPlatform('YouTube');
    setVideoSuccess(true);
    setTimeout(() => setVideoSuccess(false), 3000);
    setShowVideoForm(false);
  };

  // Photo picker: shrink each chosen photo in the browser
  const handlePickFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setEventError('');
    setEventBusy(true);
    const picked: { name: string; data: string }[] = [];
    for (const f of Array.from(fileList).slice(0, 20)) {
      try {
        picked.push({ name: f.name, data: await compressImage(f) });
      } catch {
        setEventError(`Could not use "${f.name}". Choose a JPG or PNG photo.`);
      }
    }
    setEventFiles(prev => [...prev, ...picked].slice(0, 20));
    setEventBusy(false);
  };

  // Event Submission Handler: each photo becomes its own gallery entry, saved online
  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventBusy) return;
    if (!eventTitle.trim() || !eventDate.trim() || !eventLocation.trim()) return;
    const sources = eventFiles.map(f => f.data);
    if (sources.length === 0 && eventImageInput.startsWith('http')) sources.push(eventImageInput.trim());
    if (sources.length === 0) {
      setEventError('Please choose at least one photo.');
      return;
    }

    setEventBusy(true);
    setEventError('');
    const base = Date.now();
    try {
      for (let i = 0; i < sources.length; i++) {
        const id = `evt-${base}-${i}`;
        await saveEventToFirestore({
          id,
          title: eventTitle.trim(),
          description: eventDesc.trim() || 'Official archival coverage from Ceylon Review public dispatches.',
          imageUrl: sources[i],
          date: eventDate.trim(),
          location: eventLocation.trim(),
          createdAt: new Date(base + (sources.length - 1 - i)).toISOString()
        });
      }
    } catch (err) {
      setEventBusy(false);
      setEventError('Could not save to the gallery. Make sure you are signed in as the editor and that the "events" rule is published in Firebase.');
      return;
    }

    setEventTitle('');
    setEventDesc('');
    setEventImageInput('');
    setEventFiles([]);
    setEventDate('');
    setEventLocation('');
    setEventBusy(false);
    setEventSuccess(true);
    setTimeout(() => setEventSuccess(false), 3000);
    setShowEventForm(false);
  };

  // Deletion Handlers
  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleDeleteSet = async (set: EventSet) => {
    setConfirmKey(null);
    for (const it of set.items) await handleDeleteEvent(it.id);
    setActiveSetKey(null);
  };

  const handleAddToSet = async (set: EventSet, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setAddBusy(true);
    setEventError('');
    const m = SET_ID_RE.exec(set.items[0].id);
    const base = m ? m[1] : String(Date.now());
    let next = Math.max(...set.items.map((it) => Number(SET_ID_RE.exec(it.id)?.[2] ?? -1))) + 1;
    try {
      for (const f of Array.from(fileList).slice(0, 20)) {
        const data = await compressImage(f);
        await saveEventToFirestore({
          id: `evt-${base}-${next++}`,
          title: set.title,
          description: set.items[0].description,
          imageUrl: data,
          date: set.items[0].date,
          location: set.items[0].location,
          createdAt: new Date().toISOString()
        });
      }
    } catch {
      setEventError('Could not add those photos. Make sure you are signed in as the editor.');
    }
    setAddBusy(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (cloudEvents.some(ev => ev.id === id)) {
      try {
        await deleteEventFromFirestore(id);
      } catch {
        setEventError('Could not delete that photo. Make sure you are signed in as the editor.');
      }
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 pb-12 select-text animate-in fade-in duration-300" id="viewport-media-desk">
      
      {/* Intro Editorial Section */}
      <div className="text-center bg-white border-2 border-[#7a1f2b]/40 rounded p-6 md:p-8 mb-8 shadow-xl" id="media-editorial-stamp">
        <div className="flex justify-center items-center gap-2 text-[#7a1f2b] mb-2 font-mono text-xs font-bold uppercase tracking-wider">
          <Film size={14} />
          <span>Sovereign Broadcast & Visual Archive</span>
          <Sparkles size={12} className="animate-pulse" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-tight">
          MULTIMEDIA PRESS ROOM
        </h2>
        <p className="font-sans text-xs md:text-sm text-stone-600 max-w-2xl mx-auto mt-2 leading-relaxed">
          Access public briefings, digital source protection guides, panel broadcasts, and physical archives tracking regional and global constitutional safeguards.
        </p>
      </div>

      {/* Sub tabs inside Media Hub */}
      <div className="flex justify-center gap-4 mb-8" id="media-tabs-wrapper">
        <button
          onClick={() => setActiveMediaTab('videos')}
          className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 transition-all cursor-pointer rounded ${
            activeMediaTab === 'videos'
              ? 'bg-[#7a1f2b] text-white border-[#9b2c3b] shadow-md font-bold'
              : 'bg-white border-[#7a1f2b]/30 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
          id="media-tab-videos"
        >
          <Video size={13} />
          <span>Video Dispatches ({videos.length})</span>
        </button>
        <button
          onClick={() => setActiveMediaTab('events')}
          className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 transition-all cursor-pointer rounded ${
            activeMediaTab === 'events'
              ? 'bg-[#7a1f2b] text-white border-[#9b2c3b] shadow-md font-bold'
              : 'bg-white border-[#7a1f2b]/30 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
          id="media-tab-events"
        >
          <ImageIcon size={13} />
          <span>Events Gallery ({shownEvents.length})</span>
        </button>
      </div>

      {/* Notification Success Toast */}
      {(videoSuccess || eventSuccess) && (
        <div className="bg-[#f8eff1]/80 text-stone-900 border-2 border-[#8a2432] p-4 mb-6 rounded flex items-center justify-between shadow-lg" id="submit-toast-alert">
          <div className="flex items-center gap-2">
            <Check size={16} className="bg-[#5e1620] text-[#e6c3ca] rounded-full p-0.5" />
            <span className="font-mono text-xs font-bold uppercase">Dispatch successfully published to local ledger!</span>
          </div>
          <button onClick={() => { setVideoSuccess(false); setEventSuccess(false); }} className="text-stone-600 hover:text-stone-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ==================== 1. VIDEO DISPATCH HUB ==================== */}
      {activeMediaTab === 'videos' && (
        <div className="space-y-8" id="section-video-hub">
          
          {/* Action Header & Toggle Form */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#7a1f2b]/30 pb-4" id="videos-section-header">
            <div>
              <h3 className="font-serif font-black text-xl text-stone-900 uppercase">
                Curated Analytical Broadcasts
              </h3>
              <p className="font-sans text-xs text-stone-600 mt-0.5">
                Constitutional timelines, media protections, and press-freedom panels.
              </p>
            </div>
            <button
              onClick={() => setShowVideoForm(!showVideoForm)}
              className="flex items-center gap-1.5 bg-[#7a1f2b] hover:bg-[#5e1620] text-white font-mono text-[11px] font-bold uppercase py-2 px-3.5 rounded transition-all cursor-pointer shadow"
              id="toggle-video-form-btn"
            >
              {showVideoForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showVideoForm ? 'Close Portal' : 'Post Video Dispatch'}</span>
            </button>
          </div>

          {/* Collapsible Video Submission Form */}
          {showVideoForm && (
            <div className="bg-white border-2 border-[#7a1f2b]/40 rounded p-6 max-w-2xl mx-auto shadow-2xl animate-in slide-in-from-top-4 duration-200" id="video-submit-form-container">
              <h4 className="font-serif font-black text-base text-stone-900 border-b border-[#7a1f2b]/30 pb-2 mb-4 uppercase flex items-center gap-1.5">
                <Video size={14} className="text-[#7a1f2b]" />
                Post New Broadcast Dispatch
              </h4>
              <form onSubmit={handlePostVideo} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter analytical title..."
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                    Summary/Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Record key concepts, panel guests, or statutory timeline references..."
                    value={videoDesc}
                    onChange={e => setVideoDesc(e.target.value)}
                    className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b] resize-none font-sans"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Platform Embed or Watch Link *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={videoUrlInput}
                      onChange={e => setVideoUrlInput(e.target.value)}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Default Platform
                    </label>
                    <select
                      value={videoPlatform}
                      onChange={e => setVideoPlatform(e.target.value as any)}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b2c3b] font-bold"
                    >
                      <option value="YouTube" className="bg-stone-100 text-stone-900">YouTube</option>
                      <option value="Vimeo" className="bg-stone-100 text-stone-900">Vimeo</option>
                      <option value="Other" className="bg-stone-100 text-stone-900">Direct Video / MP4 Link</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] font-sans text-stone-500 italic">
                  * Note: Real video IDs will be automatically extracted and loaded in our interactive, frame-compliant players.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVideoForm(false)}
                    className="bg-stone-100 border border-[#7a1f2b]/40 text-stone-600 font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={eventBusy}
                    className="bg-[#7a1f2b] hover:bg-[#5e1620] disabled:opacity-60 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-5 rounded shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <FileVideo size={11} />
                    Broadcast Now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Video Grid */}
          {videos.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-[#7a1f2b]/30 rounded" id="no-videos-box">
              <p className="font-serif text-lg italic text-stone-700">"No broadcasting recordings currently logged in the ledger."</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="video-dispatches-grid">
              {videos.map(video => {
                const embedSrc = getEmbedUrl(video.videoUrl, video.platform);
                return (
                  <div 
                    key={video.id} 
                    className="bg-white border-2 border-[#7a1f2b]/35 rounded-md overflow-hidden flex flex-col justify-between hover:border-[#9b2c3b]/60 shadow-xl transition-all duration-300"
                    id={`video-card-${video.id}`}
                  >
                    {/* Embedded Frame or Dynamic Overlay */}
                    <div className="relative aspect-video w-full bg-black border-b border-[#7a1f2b]/30">
                      {embedSrc ? (
                        <iframe
                          src={embedSrc}
                          title={video.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-950 text-stone-900 text-center">
                          <Play size={32} className="text-[#7a1f2b] mb-2 animate-pulse" />
                          <p className="font-mono text-[10px] uppercase font-bold tracking-wider mb-1">Direct External Source Link</p>
                          <a 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#7a1f2b] hover:text-[#6a1a26] hover:underline font-serif mt-1 font-bold"
                          >
                            <span>Launch Feed</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                      {/* Platform Badging */}
                      <span className="absolute top-2 left-2 bg-white/90 border border-[#7a1f2b]/50 text-stone-900 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold select-none">
                        {video.platform}
                      </span>
                    </div>

                    {/* Meta and content */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-black text-sm text-stone-900 leading-snug hover:text-[#7a1f2b] transition-colors">
                            {video.title}
                          </h4>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-[#7a1f2b] hover:text-[#6a1a26] bg-[#f8eff1]/60 p-1 rounded border border-[#6a1a26]/60 cursor-pointer"
                              title="Delete Video from list"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="font-sans text-xs text-stone-700 leading-relaxed line-clamp-3">
                          {video.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-[#7a1f2b]/25 flex justify-between items-center text-[10px] font-mono text-stone-600">
                        <span className="font-bold">{video.publishedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLikeVideo(video.id)}
                            className="flex items-center gap-1 bg-stone-100 hover:bg-stone-100 px-2.5 py-1 rounded border border-[#7a1f2b]/35 cursor-pointer transition-colors text-stone-900"
                          >
                            <ThumbsUp size={10} className="text-[#7a1f2b]" />
                            <span>{video.likes} Recommended</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. EVENTS PHOTO GALLERY ==================== */}
      {activeMediaTab === 'events' && (
        <div className="space-y-8" id="section-events-gallery">
          
          {/* Action Header & Toggle Form */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#7a1f2b]/30 pb-4" id="events-section-header">
            <div>
              <h3 className="font-serif font-black text-xl text-stone-900 uppercase">
                Archival Event Dispatch Logs
              </h3>
              <p className="font-sans text-xs text-stone-600 mt-0.5">
                Photo dispatches tracking physical workshops, assemblies, and retreats.
              </p>
            </div>
            {isAdmin && <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center gap-1.5 bg-[#7a1f2b] hover:bg-[#5e1620] text-white font-mono text-[11px] font-bold uppercase py-2 px-3.5 rounded transition-all cursor-pointer shadow"
              id="toggle-event-form-btn"
            >
              {showEventForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showEventForm ? 'Close Portal' : 'Upload Photos'}</span>
            </button>}
          </div>

          {/* Collapsible Event Submission Form */}
          {isAdmin && showEventForm && (
            <div className="bg-white border-2 border-[#7a1f2b]/40 rounded p-6 max-w-2xl mx-auto shadow-2xl animate-in slide-in-from-top-4 duration-200" id="event-submit-form-container">
              <h4 className="font-serif font-black text-base text-stone-900 border-b border-[#7a1f2b]/30 pb-2 mb-4 uppercase flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#7a1f2b]" />
                Record New Gallery Event
              </h4>
              <form onSubmit={handlePostEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sovereign Press Meeting..."
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Photos from your device *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => { handlePickFiles(e.target.files); e.target.value = ''; }}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2 text-xs text-stone-900 file:mr-3 file:rounded file:border-0 file:bg-[#7a1f2b] file:text-white file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:font-bold file:uppercase file:cursor-pointer"
                      id="event-photo-input"
                    />
                    <input
                      type="text"
                      placeholder="…or paste an image link (optional)"
                      value={eventImageInput}
                      onChange={e => setEventImageInput(e.target.value)}
                      className="mt-2 w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2 text-[11px] text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Event Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. June 24, 2026..."
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                      Location / Chambers *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kandy Botanical Sanctuary..."
                      value={eventLocation}
                      onChange={e => setEventLocation(e.target.value)}
                      className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#6a1a26] mb-1">
                    Event Description / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context, agenda items, or outcomes of this meeting..."
                    value={eventDesc}
                    onChange={e => setEventDesc(e.target.value)}
                    className="w-full bg-stone-100 border-2 border-[#7a1f2b]/35 rounded p-2.5 text-xs text-stone-900 placeholder-gray-500 focus:outline-none focus:border-[#9b2c3b] resize-none font-sans"
                  />
                </div>

                {eventFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2" id="event-photo-previews">
                    {eventFiles.map((f, i) => (
                      <div key={i} className="relative w-20 h-20 border border-[#7a1f2b]/40 rounded overflow-hidden">
                        <img src={f.data} alt={f.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEventFiles(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded p-0.5 cursor-pointer"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {eventFiles.length > 1 && (
                  <p className="font-mono text-[10px] text-stone-600">These {eventFiles.length} photos will be saved together as one set under this title.</p>
                )}
                {eventError && <p role="alert" className="text-xs font-sans font-semibold text-[#7a1f2b]">{eventError}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="bg-stone-100 border border-[#7a1f2b]/40 text-stone-600 font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7a1f2b] hover:bg-[#5e1620] text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-5 rounded shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ImageIcon size={11} />
                    {eventBusy ? 'Working…' : 'Publish to Gallery'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events Grid */}
          {shownEvents.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-[#7a1f2b]/30 rounded" id="no-events-box">
              <p className="font-serif text-lg italic text-stone-700">"No official events currently archived in the photobook."</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-photo-grid">
              {sets.map(set => { const item = set.items[0]; return (
                <div 
                  key={set.key}
                  onClick={() => openSet(set.key)}
                  className="bg-white border-2 border-[#7a1f2b]/35 rounded overflow-hidden flex flex-col justify-between hover:border-[#9b2c3b]/60 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  id={`event-card-${set.key}`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-950 border-b border-[#7a1f2b]/25">
                    <img 
                      src={item.imageUrl} 
                      alt={set.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="flex items-center gap-1 bg-white text-stone-900 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-sm border border-[#9b2c3b]/50 shadow font-bold">
                        <Eye size={11} className="text-[#7a1f2b]" />
                        {set.items.length > 1 ? `View ${set.items.length} Photos` : 'View Archive Image'}
                      </span>
                    </div>
                    {set.items.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <ImageIcon size={10} /> {set.items.length} photos
                      </span>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-black text-sm text-stone-900 group-hover:text-[#7a1f2b] transition-colors leading-snug">
                          {set.title}
                        </h4>
                        {isAdmin && (
                          confirmKey === set.key ? (
                            <span className="flex items-center gap-1 shrink-0 text-[10px] font-mono font-bold" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleDeleteSet(set)} className="bg-[#7a1f2b] text-white px-2 py-0.5 rounded cursor-pointer">
                                Delete{set.items.length > 1 ? ` ${set.items.length}` : ''}
                              </button>
                              <button onClick={() => setConfirmKey(null)} className="text-stone-600 underline cursor-pointer">Cancel</button>
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmKey(set.key);
                              }}
                              className="text-[#7a1f2b] hover:text-[#6a1a26] bg-[#f8eff1]/60 p-1 rounded border border-[#6a1a26]/60 cursor-pointer"
                              title={set.items.length > 1 ? 'Delete this whole set' : 'Delete Event Log'}
                            >
                              <Trash2 size={12} />
                            </button>
                          )
                        )}
                      </div>
                      <p className="font-sans text-xs text-stone-700 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="mt-4 pt-3 border-t border-[#7a1f2b]/25 space-y-1.5 text-[10px] font-mono text-stone-600 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-[#7a1f2b]" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#7a1f2b]" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Overlay Modal */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
          id="gallery-lightbox-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white border-4 border-[#7a1f2b] max-w-4xl w-full rounded-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            id="gallery-lightbox-card"
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-2 right-2 z-10 bg-stone-100 text-white p-2 rounded-full hover:bg-[#7a1f2b] transition-colors cursor-pointer border border-[#7a1f2b]/50"
              title="Close Image Chamber"
            >
              <X size={16} />
            </button>

            {/* Photo Column */}
            <div className="md:w-3/5 bg-zinc-950 flex items-center justify-center relative min-h-[300px]">
              <img 
                src={activeLightboxImage.imageUrl} 
                alt={activeLightboxImage.title}
                className="w-full h-full object-contain max-h-[80vh]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800';
                }}
              />
              {activeSet && activeSet.items.length > 1 && (
                <>
                  <button
                    onClick={() => stepSet(-1)}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full cursor-pointer"
                    id="lightbox-prev"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => stepSet(1)}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full cursor-pointer"
                    id="lightbox-next"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded">
                    {Math.min(activeIndex, activeSet.items.length - 1) + 1} / {activeSet.items.length}
                  </span>
                </>
              )}
            </div>

            {/* Info details Column */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white">
              <div className="space-y-4">
                <span className="font-mono text-[9px] bg-[#7a1f2b] text-white px-2 py-0.5 rounded font-black uppercase tracking-widest inline-block shadow">
                  Sovereign Press Council Archive
                </span>
                
                <h3 className="font-serif font-black text-xl md:text-2xl text-stone-900 uppercase tracking-normal leading-tight">
                  {activeSet ? activeSet.title : activeLightboxImage.title}
                </h3>
                
                <p className="font-sans text-xs md:text-sm text-stone-700 leading-relaxed">
                  {activeLightboxImage.description}
                </p>
              </div>

              {/* Meta indicators */}
              <div className="mt-8 pt-4 border-t-2 border-[#7a1f2b]/30 space-y-2 text-xs font-mono text-stone-600 font-bold">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#7a1f2b] shrink-0" />
                  <span>Logged Date: {activeLightboxImage.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#7a1f2b] shrink-0" />
                  <span>Sovereign Chamber: {activeLightboxImage.location}</span>
                </div>
                {isAdmin && activeSet && (
                  <div className="pt-3 space-y-2">
                    <label className="flex items-center gap-1.5 bg-[#7a1f2b] hover:bg-[#5e1620] text-white px-3 py-1.5 rounded text-[10px] uppercase cursor-pointer w-fit">
                      <Plus size={11} /> {addBusy ? 'Adding…' : 'Add photos to this set'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={addBusy}
                        onChange={(e) => { handleAddToSet(activeSet, e.target.files); e.target.value = ''; }}
                        id="set-add-photos-input"
                      />
                    </label>
                    {activeSet.items.length > 1 && (
                      <button
                        onClick={async () => { await handleDeleteEvent(activeLightboxImage.id); setActiveIndex(0); }}
                        className="flex items-center gap-1.5 border border-[#7a1f2b]/60 text-[#7a1f2b] px-3 py-1.5 rounded text-[10px] uppercase cursor-pointer"
                      >
                        <Trash2 size={11} /> Delete this photo
                      </button>
                    )}
                    {eventError && <p role="alert" className="text-[11px] font-sans font-semibold text-[#7a1f2b]">{eventError}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
