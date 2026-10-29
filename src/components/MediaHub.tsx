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
  Check
} from 'lucide-react';

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

  // Lightbox Modal for Gallery Events
  const [activeLightboxImage, setActiveLightboxImage] = useState<EventItem | null>(null);

  // Keyboard Escape & Scroll Lock for Lightbox
  useEffect(() => {
    if (!activeLightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeLightboxImage]);

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
    localStorage.setItem('ceylon_review_videos_v2', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('ceylon_review_events_v2', JSON.stringify(events));
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

  // Event Submission Handler
  const handlePostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventImageInput.trim() || !eventDate.trim() || !eventLocation.trim()) return;

    // Use default Unsplash search if image looks empty or generic
    const imageUrl = eventImageInput.startsWith('http') 
      ? eventImageInput 
      : 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800';

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      description: eventDesc || 'Official archival coverage from Ceylon Review public dispatches.',
      imageUrl: imageUrl,
      date: eventDate,
      location: eventLocation
    };

    setEvents([newEvent, ...events]);

    // Reset Form
    setEventTitle('');
    setEventDesc('');
    setEventImageInput('');
    setEventDate('');
    setEventLocation('');
    setEventSuccess(true);
    setTimeout(() => setEventSuccess(false), 3000);
    setShowEventForm(false);
  };

  // Deletion Handlers
  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this video dispatch?')) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event gallery item?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 pb-12 select-text animate-in fade-in duration-300" id="viewport-media-desk">
      
      {/* Intro Editorial Section */}
      <div className="text-center bg-[#ebdcb9]/45 border-2 border-[#580a0a]/35 rounded p-6 md:p-8 mb-8" id="media-editorial-stamp">
        <div className="flex justify-center items-center gap-2 text-[#580a0a] mb-2 font-mono text-xs font-bold uppercase tracking-wider">
          <Film size={14} />
          <span>Sovereign Broadcast & Visual Archive</span>
          <Sparkles size={12} className="animate-pulse" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-black text-[#141110] uppercase tracking-tight">
          MULTIMEDIA PRESS ROOM
        </h2>
        <p className="font-sans text-xs md:text-sm text-[#5e5347] max-w-2xl mx-auto mt-2 leading-relaxed">
          Access public briefings, digital source protection guides, panel broadcasts, and physical archives tracking regional and global constitutional safeguards.
        </p>
      </div>

      {/* Sub tabs inside Media Hub */}
      <div className="flex justify-center gap-4 mb-8" id="media-tabs-wrapper">
        <button
          onClick={() => setActiveMediaTab('videos')}
          className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 transition-all cursor-pointer rounded ${
            activeMediaTab === 'videos'
              ? 'bg-[#580a0a] text-[#f5eedc] border-[#580a0a] shadow-sm'
              : 'bg-[#fcfaf3] border-[#580a0a]/20 text-[#5e5347] hover:bg-[#ebdcb9]/30'
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
              ? 'bg-[#580a0a] text-[#f5eedc] border-[#580a0a] shadow-sm'
              : 'bg-[#fcfaf3] border-[#580a0a]/20 text-[#5e5347] hover:bg-[#ebdcb9]/30'
          }`}
          id="media-tab-events"
        >
          <ImageIcon size={13} />
          <span>Events Gallery ({events.length})</span>
        </button>
      </div>

      {/* Notification Success Toast */}
      {(videoSuccess || eventSuccess) && (
        <div className="bg-emerald-800 text-white border-2 border-emerald-950 p-4 mb-6 rounded flex items-center justify-between shadow-lg" id="submit-toast-alert">
          <div className="flex items-center gap-2">
            <Check size={16} className="bg-emerald-950 text-emerald-300 rounded-full p-0.5" />
            <span className="font-mono text-xs font-bold uppercase">Dispatch successfully published to local ledger!</span>
          </div>
          <button onClick={() => { setVideoSuccess(false); setEventSuccess(false); }} className="text-white/60 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ==================== 1. VIDEO DISPATCH HUB ==================== */}
      {activeMediaTab === 'videos' && (
        <div className="space-y-8" id="section-video-hub">
          
          {/* Action Header & Toggle Form */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#580a0a]/20 pb-4" id="videos-section-header">
            <div>
              <h3 className="font-serif font-black text-xl text-[#141110] uppercase">
                Curated Analytical Broadcasts
              </h3>
              <p className="font-sans text-xs text-[#5e5347] mt-0.5">
                Constitutional timelines, media protections, and press-freedom panels.
              </p>
            </div>
            <button
              onClick={() => setShowVideoForm(!showVideoForm)}
              className="flex items-center gap-1.5 bg-[#580a0a] hover:bg-[#731212] text-white font-mono text-[11px] font-bold uppercase py-2 px-3.5 rounded transition-all cursor-pointer"
              id="toggle-video-form-btn"
            >
              {showVideoForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showVideoForm ? 'Close Portal' : 'Post Video Dispatch'}</span>
            </button>
          </div>

          {/* Collapsible Video Submission Form */}
          {showVideoForm && (
            <div className="bg-[#fcfaf3] border-2 border-[#580a0a]/30 rounded p-6 max-w-2xl mx-auto shadow-md animate-in slide-in-from-top-4 duration-200" id="video-submit-form-container">
              <h4 className="font-serif font-black text-base text-[#580a0a] border-b border-[#580a0a]/15 pb-2 mb-4 uppercase">
                Post New Broadcast Dispatch
              </h4>
              <form onSubmit={handlePostVideo} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter analytical title..."
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                    Summary/Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Record key concepts, panel guests, or statutory timeline references..."
                    value={videoDesc}
                    onChange={e => setVideoDesc(e.target.value)}
                    className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Platform Embed or Watch Link *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={videoUrlInput}
                      onChange={e => setVideoUrlInput(e.target.value)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Default Platform
                    </label>
                    <select
                      value={videoPlatform}
                      onChange={e => setVideoPlatform(e.target.value as any)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] font-bold"
                    >
                      <option value="YouTube">YouTube</option>
                      <option value="Vimeo">Vimeo</option>
                      <option value="Other">Direct Video / MP4 Link</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] font-sans text-[#5e5347] italic">
                  * Note: Real video IDs will be automatically extracted and loaded in our interactive, frame-compliant players.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVideoForm(false)}
                    className="bg-[#ebdcb9]/40 border border-[#580a0a]/25 font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-[#ebdcb9]/85 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#580a0a] hover:bg-[#731212] text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-5 rounded shadow transition-all cursor-pointer flex items-center gap-1"
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
            <div className="text-center py-20 bg-[#ebdcb9]/10 border-2 border-dashed border-[#580a0a]/20 rounded" id="no-videos-box">
              <p className="font-serif text-lg italic text-[#5e5347]">"No broadcasting recordings currently logged in the ledger."</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="video-dispatches-grid">
              {videos.map(video => {
                const embedSrc = getEmbedUrl(video.videoUrl, video.platform);
                return (
                  <div 
                    key={video.id} 
                    className="bg-[#fcfaf3] border-2 border-[#580a0a]/20 rounded-md overflow-hidden flex flex-col justify-between hover:border-[#580a0a]/50 transition-all duration-300"
                    id={`video-card-${video.id}`}
                  >
                    {/* Embedded Frame or Dynamic Overlay */}
                    <div className="relative aspect-video w-full bg-black border-b border-[#580a0a]/15">
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
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-950 text-white text-center">
                          <Play size={32} className="text-[#ebdcb9] mb-2 animate-pulse" />
                          <p className="font-mono text-[10px] uppercase font-bold tracking-wider mb-1">Direct External Source Link</p>
                          <a 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#ebdcb9] hover:underline font-serif mt-1 font-bold"
                          >
                            <span>Launch Feed</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                      {/* Platform Badging */}
                      <span className="absolute top-2 left-2 bg-[#141110]/80 border border-[#f5eedc]/35 text-[#ebdcb9] text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold select-none">
                        {video.platform}
                      </span>
                    </div>

                    {/* Meta and content */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-black text-sm text-[#141110] leading-snug hover:text-[#580a0a] transition-colors">
                            {video.title}
                          </h4>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-700 hover:text-red-900 bg-red-50 p-1 rounded border border-red-200 cursor-pointer"
                              title="Delete Video from list"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="font-sans text-xs text-[#5e5347] leading-relaxed line-clamp-3">
                          {video.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-[#580a0a]/10 flex justify-between items-center text-[10px] font-mono text-[#5e5347]">
                        <span className="font-bold">{video.publishedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLikeVideo(video.id)}
                            className="flex items-center gap-1 bg-[#ebdcb9]/50 hover:bg-[#ebdcb9] px-2.5 py-1 rounded border border-[#580a0a]/20 cursor-pointer transition-colors text-[#141110]"
                          >
                            <ThumbsUp size={10} />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#580a0a]/20 pb-4" id="events-section-header">
            <div>
              <h3 className="font-serif font-black text-xl text-[#141110] uppercase">
                Archival Event Dispatch Logs
              </h3>
              <p className="font-sans text-xs text-[#5e5347] mt-0.5">
                Photo dispatches tracking physical workshops, assemblies, and retreats.
              </p>
            </div>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center gap-1.5 bg-[#580a0a] hover:bg-[#731212] text-white font-mono text-[11px] font-bold uppercase py-2 px-3.5 rounded transition-all cursor-pointer"
              id="toggle-event-form-btn"
            >
              {showEventForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showEventForm ? 'Close Portal' : 'Record Gallery Event'}</span>
            </button>
          </div>

          {/* Collapsible Event Submission Form */}
          {showEventForm && (
            <div className="bg-[#fcfaf3] border-2 border-[#580a0a]/30 rounded p-6 max-w-2xl mx-auto shadow-md animate-in slide-in-from-top-4 duration-200" id="event-submit-form-container">
              <h4 className="font-serif font-black text-base text-[#580a0a] border-b border-[#580a0a]/15 pb-2 mb-4 uppercase">
                Record New Gallery Event
              </h4>
              <form onSubmit={handlePostEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sovereign Press Meeting..."
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Image URL (Unsplash or direct URL) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={eventImageInput}
                      onChange={e => setEventImageInput(e.target.value)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Event Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. June 24, 2026..."
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                      Location / Chambers *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kandy Botanical Sanctuary..."
                      value={eventLocation}
                      onChange={e => setEventLocation(e.target.value)}
                      className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-black uppercase text-[#5e5347] mb-1">
                    Event Description / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context, agenda items, or outcomes of this meeting..."
                    value={eventDesc}
                    onChange={e => setEventDesc(e.target.value)}
                    className="w-full bg-white border-2 border-[#580a0a]/25 rounded p-2.5 text-xs text-[#141110] focus:outline-none focus:border-[#580a0a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="bg-[#ebdcb9]/40 border border-[#580a0a]/25 font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-[#ebdcb9]/85 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#580a0a] hover:bg-[#731212] text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-5 rounded shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ImageIcon size={11} />
                    Log Event Item
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="text-center py-20 bg-[#ebdcb9]/10 border-2 border-dashed border-[#580a0a]/20 rounded" id="no-events-box">
              <p className="font-serif text-lg italic text-[#5e5347]">"No official events currently archived in the photobook."</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-photo-grid">
              {events.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveLightboxImage(item)}
                  className="bg-[#fcfaf3] border-2 border-[#580a0a]/20 rounded overflow-hidden flex flex-col justify-between hover:border-[#580a0a]/55 hover:shadow-md transition-all duration-300 group cursor-pointer"
                  id={`event-card-${item.id}`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-950 border-b border-[#580a0a]/15">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="flex items-center gap-1 bg-[#141110] text-[#f5eedc] text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-sm border border-[#580a0a]/40 shadow font-bold">
                        <Eye size={11} />
                        View Archive Image
                      </span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-black text-sm text-[#141110] group-hover:text-[#580a0a] transition-colors leading-snug">
                          {item.title}
                        </h4>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(item.id);
                            }}
                            className="text-red-700 hover:text-red-900 bg-red-50 p-1 rounded border border-red-200 cursor-pointer"
                            title="Delete Event Log"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="font-sans text-xs text-[#5e5347] leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="mt-4 pt-3 border-t border-[#580a0a]/10 space-y-1.5 text-[10px] font-mono text-[#5e5347] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-[#580a0a]" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#580a0a]" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Overlay Modal */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-[#141110]/95 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
          id="gallery-lightbox-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#f5eedc] border-4 border-[#580a0a] max-w-4xl w-full rounded-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            id="gallery-lightbox-card"
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-2 right-2 z-10 bg-[#141110] text-white p-2 rounded-full hover:bg-[#580a0a] transition-colors cursor-pointer border border-[#ebdcb9]"
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
            </div>

            {/* Info details Column */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#f5eedc]">
              <div className="space-y-4">
                <span className="font-mono text-[9px] bg-[#580a0a] text-[#f5eedc] px-2 py-0.5 rounded font-black uppercase tracking-widest inline-block">
                  Sovereign Press Council Archive
                </span>
                
                <h3 className="font-serif font-black text-xl md:text-2xl text-[#141110] uppercase tracking-normal leading-tight">
                  {activeLightboxImage.title}
                </h3>
                
                <p className="font-sans text-xs md:text-sm text-[#5e5347] leading-relaxed">
                  {activeLightboxImage.description}
                </p>
              </div>

              {/* Meta indicators */}
              <div className="mt-8 pt-4 border-t-2 border-[#580a0a]/15 space-y-2 text-xs font-mono text-[#5e5347] font-bold">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#580a0a] shrink-0" />
                  <span>Logged Date: {activeLightboxImage.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#580a0a] shrink-0" />
                  <span>Sovereign Chamber: {activeLightboxImage.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
