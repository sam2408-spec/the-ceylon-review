import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import SearchBar from './components/SearchBar';
import EditorialNote from './components/EditorialNote';
import ArticleCard from './components/ArticleCard';
import ArticleDetailModal from './components/ArticleDetailModal';
import WriterProfileView from './components/WriterProfileView';
import BookmarksDrawer from './components/BookmarksDrawer';
import MediaHub from './components/MediaHub';
import SovereignEditorialDesk from './components/SovereignEditorialDesk';
import PartnerPanel from './components/PartnerPanel';
import SocialHandles from './components/SocialHandles';
import GazaColumn from './components/GazaColumn';
import NewsPortal from './components/NewsPortal';
import { INITIAL_ARTICLES, INITIAL_WRITERS } from './initialData';
import { Article, Writer, Category } from './types';
import { Shield, Mail, Globe, Play, Film, ExternalLink, HelpCircle, Users, Settings } from 'lucide-react';
import { 
  auth, 
  signInEditorWithGoogle, 
  signOutEditor, 
  subscribeToArticles, 
  subscribeToWriters,
  saveArticleToFirestore,
  updateArticleInFirestore,
  deleteArticleFromFirestore,
  saveWriterToFirestore,
  deleteWriterFromFirestore,
  seedInitialFirestoreArchives,
  fetchArticleById
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Deletion Persistence State ---
  const [deletedArticleIds, setDeletedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('the_ceylon_review_deleted_articles_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deletedWriterIds, setDeletedWriterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('the_ceylon_review_deleted_writers_v2');
      return saved ? JSON.parse(saved) : ['w-arjun', 'w-dilini'];
    } catch (e) {
      return ['w-arjun', 'w-dilini'];
    }
  });

  // --- Persistent Storage State Hydration ---
  const [articles, setArticles] = useState<Article[]>(() => {
    const deletedIds: string[] = (() => {
      try {
        const d = localStorage.getItem('the_ceylon_review_deleted_articles_v2');
        return d ? JSON.parse(d) : [];
      } catch (e) {
        return [];
      }
    })();

    const saved = localStorage.getItem('the_ceylon_review_articles_v6');
    let loadedArticles: Article[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Never restore articles that were deleted by the editor
          loadedArticles = parsed.filter((a: Article) => !deletedIds.includes(a.id));
        }
      } catch (e) {
        console.error('Failed to parse articles from storage, reverting to default.', e);
      }
    }

    if (loadedArticles.length === 0) {
      loadedArticles = INITIAL_ARTICLES.filter(a => !deletedIds.includes(a.id));
    } else {
      // Merge in any initial articles ONLY if they have NOT been deleted by the user!
      INITIAL_ARTICLES.forEach(initArt => {
        if (!deletedIds.includes(initArt.id) && !loadedArticles.some(a => a.id === initArt.id)) {
          loadedArticles.push(initArt);
        }
      });
    }

    // Ensure all articles point to Sameera Mahboobdeen if previously assigned to deleted profiles
    loadedArticles = loadedArticles.map(art => {
      if (art.authorId === 'w-arjun' || art.authorId === 'w-dilini') {
        return { ...art, authorId: 'w-sameera' };
      }
      return art;
    });

    // Force 'art-manufactured-silence' to be exactly at index 1 (the second article) if not deleted
    if (!deletedIds.includes('art-manufactured-silence')) {
      const silenceArticleIndex = loadedArticles.findIndex(art => art.id === 'art-manufactured-silence');
      let silenceArticle = silenceArticleIndex !== -1 
        ? loadedArticles[silenceArticleIndex] 
        : INITIAL_ARTICLES.find(art => art.id === 'art-manufactured-silence');

      if (silenceArticle) {
        let updated = [...loadedArticles];
        if (silenceArticleIndex !== -1) {
          updated.splice(silenceArticleIndex, 1);
        }
        updated.splice(1, 0, silenceArticle);
        return updated;
      }
    }

    return loadedArticles;
  });

  const [writers, setWriters] = useState<Writer[]>(() => {
    // Clear legacy storage cache containing deleted profiles
    try {
      localStorage.removeItem('the_ceylon_review_writers_v6');
    } catch (e) {}

    const deletedWriters: string[] = (() => {
      try {
        const d = localStorage.getItem('the_ceylon_review_deleted_writers_v2');
        return d ? JSON.parse(d) : ['w-arjun', 'w-dilini'];
      } catch (e) {
        return ['w-arjun', 'w-dilini'];
      }
    })();

    const saved = localStorage.getItem('the_ceylon_review_writers_v7');
    let loadedWriters: Writer[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          loadedWriters = parsed.filter((w: Writer) => !deletedWriters.includes(w.id));
        }
      } catch (e) {
        console.error('Failed to parse writers from storage, reverting to default.', e);
      }
    }

    const customAvatar = localStorage.getItem('the_ceylon_review_custom_sameera_avatar');
    if (loadedWriters.length === 0) {
      let initialList = INITIAL_WRITERS.filter(w => !deletedWriters.includes(w.id));
      if (customAvatar) {
        initialList = initialList.map(w => (w.id === 'w-sameera' || w.name.toLowerCase().includes('sameera')) ? { ...w, avatarUrl: customAvatar } : w);
      }
      return initialList;
    }

    if (customAvatar) {
      loadedWriters = loadedWriters.map(w => (w.id === 'w-sameera' || w.name.toLowerCase().includes('sameera')) ? { ...w, avatarUrl: customAvatar } : w);
    }
    return loadedWriters;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('the_ceylon_review_bookmarks_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bookmarks.', e);
      }
    }
    return [];
  });

  // --- General Navigation / UI State ---
  const [activeTab, setActiveTab] = useState<string>('current');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isEditorialDeskOpen, setIsEditorialDeskOpen] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Safe storage helper with QuotaExceededError recovery
  const safeStorageSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.number === -2147024882) {
        console.warn(`localStorage quota exceeded while saving ${key}. Purging legacy caches and retrying...`);
        try {
          // Clear legacy obsolete keys
          localStorage.removeItem('the_ceylon_review_writers_v6');
          localStorage.removeItem('the_ceylon_review_articles_v5');
          localStorage.removeItem('the_ceylon_review_articles_v4');
          localStorage.removeItem('the_ceylon_review_writers_v5');
          localStorage.removeItem('ceylon_review_events_v1');
          localStorage.removeItem('ceylon_review_videos_v1');
          
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.warn(`Could not persist ${key} to localStorage even after purge; operating in in-memory state.`, retryError);
        }
      }
    }
  };

  // Sync Editor Mode preference only when authorized
  useEffect(() => {
    if (currentUser?.email?.toLowerCase() === 'zaina2408@gmail.com' && currentUser?.emailVerified) {
      localStorage.setItem('the_ceylon_review_editor_mode', isAdminMode.toString());
    }
  }, [isAdminMode, currentUser]);

  // Sync to LocalStorage
  useEffect(() => {
    safeStorageSet('the_ceylon_review_articles_v6', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    safeStorageSet('the_ceylon_review_writers_v7', JSON.stringify(writers));
  }, [writers]);

  useEffect(() => {
    safeStorageSet('the_ceylon_review_bookmarks_v6', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Auth State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email?.toLowerCase() === 'zaina2408@gmail.com' && user.emailVerified) {
        const savedPref = localStorage.getItem('the_ceylon_review_editor_mode');
        setIsAdminMode(savedPref === null ? true : savedPref === 'true');
        seedInitialFirestoreArchives();
      } else {
        setIsAdminMode(false);
        setIsEditorialDeskOpen(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Real-Time Firestore Sync
  useEffect(() => {
    let unsubArticles: (() => void) | undefined;
    let unsubWriters: (() => void) | undefined;

    try {
      unsubArticles = subscribeToArticles((cloudArticles) => {
        if (cloudArticles && cloudArticles.length > 0) {
          const currentDeleted: string[] = (() => {
            try {
              const d = localStorage.getItem('the_ceylon_review_deleted_articles_v2');
              return d ? JSON.parse(d) : [];
            } catch (e) {
              return [];
            }
          })();

          // Filter out any articles marked as deleted by the user
          const activeCloudArticles = cloudArticles.filter(art => !currentDeleted.includes(art.id));

          // Ensure all articles point to Sameera Mahboobdeen if previously assigned to deleted profiles
          const cleanedArticles = activeCloudArticles.map(art => {
            if (art.authorId === 'w-arjun' || art.authorId === 'w-dilini') {
              return { ...art, authorId: 'w-sameera' };
            }
            return art;
          });
          setArticles(cleanedArticles);
        }
      }, (err) => {
        console.warn('Realtime articles listener fallback:', err);
      });
    } catch (e) {
      console.warn('Realtime listener init deferred:', e);
    }

    try {
      unsubWriters = subscribeToWriters((cloudWriters) => {
        if (cloudWriters && cloudWriters.length > 0) {
          const currentDeletedWriters: string[] = (() => {
            try {
              const d = localStorage.getItem('the_ceylon_review_deleted_writers_v2');
              return d ? JSON.parse(d) : ['w-arjun', 'w-dilini'];
            } catch (e) {
              return ['w-arjun', 'w-dilini'];
            }
          })();

          // Retain only valid non-deleted profiles
          const cleanedWriters = cloudWriters.filter(w => !currentDeletedWriters.includes(w.id));
          
          const isVerifiedAdmin = auth.currentUser?.email === 'zaina2408@gmail.com' && auth.currentUser?.emailVerified;

          if (isVerifiedAdmin) {
            cloudWriters.forEach(w => {
              if (currentDeletedWriters.includes(w.id) || w.id === 'w-arjun' || w.id === 'w-dilini') {
                deleteWriterFromFirestore(w.id).catch(() => {});
              }
            });
          }

          const DEFAULT_SAMEERA_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400';
          const customAvatar = localStorage.getItem('the_ceylon_review_custom_sameera_avatar');
          const finalWriters = (cleanedWriters.length > 0 ? cleanedWriters : INITIAL_WRITERS.filter(w => !currentDeletedWriters.includes(w.id))).map(w => {
            if (w.id === 'w-sameera' || w.name.toLowerCase().includes('sameera')) {
              if (w.avatarUrl && w.avatarUrl !== DEFAULT_SAMEERA_AVATAR) {
                safeStorageSet('the_ceylon_review_custom_sameera_avatar', w.avatarUrl);
                return w;
              }
              if (customAvatar) {
                const updated = { ...w, avatarUrl: customAvatar };
                if (isVerifiedAdmin && w.avatarUrl !== customAvatar) {
                  saveWriterToFirestore(updated).catch(() => {});
                }
                return updated;
              }
            }
            return w;
          });

          setWriters(finalWriters);
        }
      }, (err) => {
        console.warn('Realtime writers listener fallback:', err);
      });
    } catch (e) {
      console.warn('Realtime writer init deferred:', e);
    }

    return () => {
      unsubArticles?.();
      unsubWriters?.();
    };
  }, []);

  // Deep links (?article=id): open the linked article straight away by fetching that one
  // document, and also whenever the list loads, until it has been opened.
  const deepLinkOpened = useRef(false);
  const [openingLink, setOpeningLink] = useState(
    () => !!new URLSearchParams(window.location.search).get('article')
  );
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('article');
    if (!id) return;
    let cancelled = false;
    fetchArticleById(id).then((art) => {
      if (cancelled || deepLinkOpened.current) return;
      if (art) { deepLinkOpened.current = true; setSelectedArticle(art); }
      setOpeningLink(false);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (deepLinkOpened.current) return;
    const id = new URLSearchParams(window.location.search).get('article');
    if (!id) { deepLinkOpened.current = true; return; }
    const art = articles.find(a => a.id === id);
    if (art) {
      deepLinkOpened.current = true;
      setSelectedArticle(art);
      setOpeningLink(false);
    }
  }, [articles]);

  // Keep the address bar on a shareable link while an article is open.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedArticle) {
        if (url.searchParams.get('article') !== selectedArticle.id) {
          url.searchParams.set('article', selectedArticle.id);
          window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        }
      } else if (deepLinkOpened.current && url.searchParams.has('article')) {
        url.searchParams.delete('article');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    } catch { /* ignore */ }
  }, [selectedArticle]);

  // --- Article Interaction Handlers ---
  const handleToggleBookmark = (e: React.MouseEvent | undefined, articleId: string) => {
    if (e) {
      e.stopPropagation();
    }
    setBookmarks(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId) 
        : [...prev, articleId]
    );
  };

  const handleToggleBookmarkInModal = (articleId: string) => {
    setBookmarks(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId) 
        : [...prev, articleId]
    );
  };

  const handleRecommendArticle = (articleId: string) => {
    setArticles(prev => 
      prev.map(art => {
        if (art.id === articleId) {
          const updatedLikes = art.likes + 1;
          updateArticleInFirestore(articleId, { likes: updatedLikes }).catch(() => {});
          return { ...art, likes: updatedLikes };
        }
        return art;
      })
    );
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  const handleAddComment = (articleId: string, commenterName: string, commentText: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: commenterName,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    setArticles(prev => 
      prev.map(art => {
        if (art.id === articleId) {
          const updatedComments = [newComment, ...art.comments];
          updateArticleInFirestore(articleId, { comments: updatedComments }).catch(() => {});
          return { ...art, comments: updatedComments };
        }
        return art;
      })
    );

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => 
        prev 
          ? { ...prev, comments: [newComment, ...prev.comments] } 
          : null
      );
    }
  };

  const handleDeleteComment = (articleId: string, commentId: string) => {
    setArticles(prev => 
      prev.map(art => {
        if (art.id === articleId) {
          const updatedComments = art.comments.filter(c => c.id !== commentId);
          updateArticleInFirestore(articleId, { comments: updatedComments }).catch(() => {});
          return { ...art, comments: updatedComments };
        }
        return art;
      })
    );

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => 
        prev 
          ? { ...prev, comments: prev.comments.filter(c => c.id !== commentId) } 
          : null
      );
    }
  };

  const handleReadMore = (article: Article) => {
    setArticles(prev => 
      prev.map(art => {
        if (art.id === article.id) {
          const updatedViews = art.views + 1;
          updateArticleInFirestore(article.id, { views: updatedViews }).catch(() => {});
          return { ...art, views: updatedViews };
        }
        return art;
      })
    );
    
    setSelectedArticle({ ...article, views: article.views + 1 });
  };

  const handleAddNewArticle = (newArticleData: Omit<Article, 'id' | 'likes' | 'views' | 'comments'>) => {
    const newArticle: Article = {
      ...newArticleData,
      id: `art-${Date.now()}`,
      likes: 0,
      views: 0,
      comments: []
    };
    setArticles(prev => [newArticle, ...prev]);
    saveArticleToFirestore(newArticle).catch(err => {
      console.warn('Saved dispatch locally, Firestore sync deferred:', err);
    });
  };

  const handleAddNewWriter = (newWriter: Writer) => {
    setWriters(prev => [...prev, newWriter]);
    saveWriterToFirestore(newWriter).catch(err => {
      console.warn('Saved journalist locally, Firestore sync deferred:', err);
    });
  };

  const handleUpdateWriter = (writerId: string, updatedFields: Partial<Writer>) => {
    if (updatedFields.avatarUrl && (writerId === 'w-sameera' || writerId.includes('sameera'))) {
      try {
        localStorage.setItem('the_ceylon_review_custom_sameera_avatar', updatedFields.avatarUrl);
      } catch (e) {}
    }

    setWriters(prev => {
      const updated = prev.map(w => 
        w.id === writerId 
          ? { ...w, ...updatedFields }
          : w
      );
      safeStorageSet('the_ceylon_review_writers_v7', JSON.stringify(updated));

      const target = updated.find(w => w.id === writerId);
      if (target && auth.currentUser?.email === 'zaina2408@gmail.com' && auth.currentUser?.emailVerified) {
        saveWriterToFirestore(target).catch(err => {
          console.warn('Writer changes saved locally, cloud deferred:', err);
        });
      }
      return updated;
    });

    showToast("Profile modifications and portrait saved permanently.");
  };

  const handleDeleteWriter = (writerId: string) => {
    if (writerId === 'w-sameera') {
      showToast("Sameera Mahboobdeen is the principal Founder & Editor-in-Chief and cannot be deleted.");
      return; // Do not delete Editor-in-Chief Sameera Mahboobdeen
    }

    // 1. Mark as permanently deleted in deletedWriterIds
    setDeletedWriterIds(prev => {
      const updated = prev.includes(writerId) ? prev : [...prev, writerId];
      safeStorageSet('the_ceylon_review_deleted_writers_v2', JSON.stringify(updated));
      return updated;
    });

    // 2. Remove writer from active state & update storage
    setWriters(prev => {
      const updated = prev.filter(w => w.id !== writerId);
      safeStorageSet('the_ceylon_review_writers_v7', JSON.stringify(updated));
      return updated;
    });

    // 3. Reassign any articles under this writer to Sameera Mahboobdeen
    setArticles(prev => {
      const updated = prev.map(art => art.authorId === writerId ? { ...art, authorId: 'w-sameera' } : art);
      safeStorageSet('the_ceylon_review_articles_v6', JSON.stringify(updated));
      return updated;
    });

    // 4. Delete permanently from Firestore
    deleteWriterFromFirestore(writerId).catch(err => {
      console.warn('Deleted writer locally, Firestore sync deferred:', err);
    });
  };

  const handleEditArticle = (articleId: string, updatedFields: Partial<Article>) => {
    setArticles(prev => 
      prev.map(art => 
        art.id === articleId 
          ? { ...art, ...updatedFields }
          : art
      )
    );

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => prev ? { ...prev, ...updatedFields } : null);
    }

    updateArticleInFirestore(articleId, updatedFields).catch(err => {
      console.warn('Saved edit locally, Firestore sync deferred:', err);
    });
    showToast("Dispatch changes authorized and published.");
  };

  const handleDeleteArticle = (articleId: string) => {
    const deletedTitle = articles.find(a => a.id === articleId)?.title || 'Article';

    // 1. Mark as permanently deleted in deletedArticleIds
    setDeletedArticleIds(prev => {
      const updated = prev.includes(articleId) ? prev : [...prev, articleId];
      safeStorageSet('the_ceylon_review_deleted_articles_v2', JSON.stringify(updated));
      return updated;
    });

    // 2. Remove from active articles state & storage
    setArticles(prev => {
      const updated = prev.filter(art => art.id !== articleId);
      safeStorageSet('the_ceylon_review_articles_v6', JSON.stringify(updated));
      return updated;
    });

    // 3. Remove from bookmarks if present
    setBookmarks(prev => {
      const updated = prev.filter(id => id !== articleId);
      safeStorageSet('the_ceylon_review_bookmarks_v6', JSON.stringify(updated));
      return updated;
    });

    // 4. Close reader modal if currently viewing this article
    if (selectedArticle?.id === articleId) {
      setSelectedArticle(null);
    }

    // 5. Delete permanently from Firestore
    deleteArticleFromFirestore(articleId).catch(err => {
      console.warn('Deleted dispatch locally, Firestore sync deferred:', err);
    });

    // 6. User-facing feedback
    showToast(`"${deletedTitle}" has been permanently deleted from the publication.`);
  };

  const handleResetData = () => {
    localStorage.removeItem('the_ceylon_review_deleted_articles_v2');
    localStorage.removeItem('the_ceylon_review_deleted_writers_v2');
    setDeletedArticleIds([]);
    setDeletedWriterIds(['w-arjun', 'w-dilini']);
    setArticles([...INITIAL_ARTICLES]);
    setWriters(INITIAL_WRITERS.filter(w => w.id === 'w-sameera'));
    setBookmarks([]);
    localStorage.removeItem('the_ceylon_review_articles_v6');
    localStorage.removeItem('the_ceylon_review_writers_v6');
    localStorage.removeItem('the_ceylon_review_writers_v7');
    localStorage.removeItem('the_ceylon_review_bookmarks_v6');
  };

  // --- Article Filtering Computations ---
  const filteredArticles = articles.filter(art => {
    const matchesTab = activeTab === 'current' ? art.isCurrent : !art.isCurrent;
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;

    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesTab && matchesCategory;

    const writerName = writers.find(w => w.id === art.authorId)?.name.toLowerCase() || '';
    const matchesKeyword = 
      art.title.toLowerCase().includes(query) ||
      art.subtitle.toLowerCase().includes(query) ||
      art.summary.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query) ||
      writerName.includes(query);

    return matchesTab && matchesCategory && matchesKeyword;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm(''); 
    setSelectedCategory('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookmarkedArticlesList = articles.filter(art => bookmarks.includes(art.id));

  const editorInChief = writers.find(w => w.id === 'w-sameera' || w.role.toLowerCase().includes('editor')) || writers[0];
  const editorName = editorInChief ? editorInChief.name : 'Sameera Mahboobdeen';
  const editorAvatar = editorInChief ? editorInChief.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400';

  // World Flash ticker: live headlines from /api/news (refreshed every 5 minutes)
  const [flashHeadlines, setFlashHeadlines] = useState<{ title: string; source: string; link: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.items) && data.items.length > 0) {
          setFlashHeadlines(data.items);
        }
      } catch {
        // Offline or no API (e.g. local dev): the ticker keeps its house line.
      }
    };
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const breakingNewsString = "THE CEYLON REVIEW — LAW, HUMAN RIGHTS & GLOBAL JUSTICE, FROM SRI LANKA";

  const isAuthorizedEditor = Boolean(
    currentUser &&
    currentUser.email?.toLowerCase() === 'zaina2408@gmail.com' &&
    currentUser.emailVerified
  );

  const effectiveAdminMode = isAuthorizedEditor && isAdminMode;

  const handleEditorSignIn = async () => {
    try {
      const user = await signInEditorWithGoogle();
      if (user) {
        if (user.email?.toLowerCase() === 'zaina2408@gmail.com' && user.emailVerified) {
          setIsAdminMode(true);
          showToast("Editor Access verified.");
        } else {
          setIsAdminMode(false);
          setIsEditorialDeskOpen(false);
          showToast("Signed in as reader. Editor access is restricted to the authorized editorial account.");
        }
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code !== 'auth/popup-closed-by-user') {
        showToast(`Sign in notification: ${err?.message || 'Please check network connection or allow popups.'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between" id="newspaper-workspace">
      <div>
        {/* Broadside Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          bookmarksCount={bookmarks.length} 
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          breakingNews={breakingNewsString}
          headlines={flashHeadlines}
          isAdmin={effectiveAdminMode}
          setIsAdmin={(val) => {
            if (isAuthorizedEditor) setIsAdminMode(val);
          }}
          isAuthorizedEditor={isAuthorizedEditor}
          currentUser={currentUser}
          onSignInGoogle={handleEditorSignIn}
          onSignOutGoogle={async () => {
            await signOutEditor();
            setIsAdminMode(false);
            setIsEditorialDeskOpen(false);
          }}
        />

        {/* Editor Authority Banner */}
        {effectiveAdminMode && (
          <div className="bg-[#007A3D] text-white px-4 py-2 border-b border-[#005a2c] shadow-md select-none" id="editor-privileges-banner">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold uppercase tracking-wider text-white">Editor Authority Active:</span>
                <span className="text-white">Full deletion & modification privileges are active directly across the page.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold hidden md:inline">{currentUser?.email}</span>
                <button
                  onClick={() => setIsEditorialDeskOpen(true)}
                  className="bg-[#00582b] hover:bg-[#004522] text-white border border-white px-3 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors shadow"
                >
                  Open Editorial Desk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Filter bar (not shown on editorial desk, privacy, or directive tab) */}
        {(activeTab === 'current' || activeTab === 'past') && (
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory}
            resultsCount={filteredArticles.length}
            totalCount={articles.filter(a => activeTab === 'current' ? a.isCurrent : !a.isCurrent).length}
            writers={writers}
            articles={articles}
            onReadArticle={handleReadMore}
          />
        )}

        {/* Viewport content router */}
        <main className="pb-16" id="main-paper-viewports">
          
          {/* CURRENT JOURNAL RELEASE */}
          {activeTab === 'current' && (
            <div className="max-w-7xl mx-auto px-4 mt-8" id="viewport-current">
              
              {searchTerm === '' && selectedCategory === 'All' && <EditorialNote />}

              {filteredArticles.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-[#7a1f2b]/35 bg-white rounded max-w-4xl mx-auto" id="fallback-no-match">
                  <p className="font-serif text-xl italic text-stone-700">"No archived dispatches fell into today's news queries."</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                    className="mt-6 font-mono text-xs font-bold uppercase tracking-widest bg-[#7a1f2b] text-white px-4 py-2 hover:bg-[#5e1620] transition-colors cursor-pointer rounded"
                  >
                    Reset Catalogue Query
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Standard Editorial grid split */}
                  {searchTerm === '' && selectedCategory === 'All' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="editorial-grid-deck">
                      
                      {/* LEFT COLUMN: news-portal front page (lead story, top stories, latest) */}
                      <div className="lg:col-span-8 space-y-8">
                        <NewsPortal articles={filteredArticles} onOpen={handleReadMore} />
                        <SocialHandles />
                      </div>

                      {/* RIGHT COLUMN: Media Matrix & Video Dossier Sidebar (Span 4) */}
                      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l-2 border-[#7a1f2b]/30 pt-8 lg:pt-0 lg:pl-8 space-y-8">
                        
                        <GazaColumn />

                        {/* 1. SECURE SUBMISSION CALLOUT BOX */}
                        <div className="bg-white text-stone-900 border-l-4 border-[#9b2c3b] p-5 rounded shadow-lg border border-[#7a1f2b]/30">
                          <h4 className="font-serif font-black text-sm text-stone-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                            <Mail size={14} className="text-[#7a1f2b]" />
                            Submit a Column
                          </h4>
                          <p className="font-sans text-[11px] text-stone-700 leading-relaxed mb-4">
                            The Ceylon Review considers sourced writing on law, human rights and public affairs. Every claim must be checked before publication. Send a short pitch to theceylonreview@proton.me.
                          </p>
                          <div className="bg-[#f8eff1] p-2 text-center rounded border border-[#7a1f2b]/40 font-mono text-[11px] font-bold">
                            Pitches: <a href="mailto:theceylonreview@proton.me" className="underline text-[#6a1a26] hover:text-stone-900">theceylonreview@proton.me</a>
                          </div>
                        </div>

                        <PartnerPanel isAdmin={effectiveAdminMode} />

                        {/* 2. GLOBAL DISPATCH & OCCUPIED LANDS SOVEREIGNTY MATRIX */}
                        <div className="bg-white border-2 border-[#7a1f2b]/40 p-5 rounded shadow-lg">
                          <h4 className="font-serif font-black text-base text-stone-900 pb-2 border-b border-[#7a1f2b]/30 mb-4 uppercase tracking-wide flex items-center gap-1.5">
                            <Globe size={15} className="text-[#9b2c3b]" />
                            Global Rights & Sovereignty Matrix
                          </h4>
                          <p className="text-[11px] font-sans text-stone-700 leading-normal mb-4">
                            Direct directories and live newscasts covering regions of systemic struggle, self-determination, and the ground-level reality of civilians standing for rights:
                          </p>

                          <div className="space-y-4">
                            {/* Al Jazeera Live Webcast Header Banner */}
                            <div className="bg-[#4a1019]/5 border border-[#4a1019]/15 p-2.5 rounded flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#8a2432] animate-pulse" />
                                <span className="font-mono text-[10px] font-bold text-[#5e1620] uppercase">Live Broadcast News</span>
                              </div>
                              <a 
                                href="https://www.aljazeera.com/live" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-mono text-[9px] font-bold uppercase underline text-[#4a1019] hover:text-[#731212] flex items-center gap-0.5"
                              >
                                Watch Al Jazeera Live <ExternalLink size={8} />
                              </a>
                            </div>

                            {/* Palestine Section */}
                            <div className="border-b border-[#4a1019]/10 pb-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-mono text-[#4a1019] font-black uppercase tracking-wider">🇵🇸 Occupied Palestine</p>
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-[#4a1019]/10 text-[#4a1019] rounded uppercase">Ground Reality</span>
                              </div>
                              <ul className="space-y-1 text-xs font-serif font-semibold">
                                <li>
                                  <a href="https://www.aljazeera.com/where/palestine/" target="_blank" rel="noopener noreferrer" className="hover:text-[#4a1019] flex items-center justify-between group py-0.5">
                                    <span>Al Jazeera Palestine Hub (Live Feed)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://mondoweiss.net" target="_blank" rel="noopener noreferrer" className="hover:text-[#4a1019] flex items-center justify-between group py-0.5">
                                    <span>Mondoweiss (Sovereign Perspective)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://www.palestinechronicle.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#4a1019] flex items-center justify-between group py-0.5">
                                    <span>Palestine Chronicle (Civilian Gazettes)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://www.middleeasteye.net" target="_blank" rel="noopener noreferrer" className="hover:text-[#4a1019] flex items-center justify-between group py-0.5">
                                    <span>Middle East Eye (West Asia Truth Focus)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                              </ul>
                            </div>

                            {/* Sudan Section */}
                            <div className="border-b border-[#7a1f2b]/20 pb-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-mono text-[#6a1a26] font-black uppercase tracking-wider">🇸🇩 Sudan Sovereignty</p>
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-[#f8eff1] text-[#6a1a26] border border-[#6a1a26]/40 rounded uppercase">Resistance</span>
                              </div>
                              <ul className="space-y-1 text-xs font-serif font-semibold text-stone-600">
                                <li>
                                  <a href="https://3ayin.com/en/" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>Ayin Network (Independent Journalism)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://www.dabangasudan.org/en" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>Dabanga Sudan (Radio & Voice Updates)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://sudanwarmonitor.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>Sudan War Monitor (Field Dispatches)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                              </ul>
                            </div>

                            {/* Congo Section */}
                            <div className="border-b border-[#7a1f2b]/20 pb-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-mono text-[#6a1a26] font-black uppercase tracking-wider">🇨🇩 Congo & Goma Reports</p>
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-[#f8eff1] text-[#6a1a26] border border-[#6a1a26]/40 rounded uppercase">Anti-Exploitation</span>
                              </div>
                              <ul className="space-y-1 text-xs font-serif font-semibold text-stone-600">
                                <li>
                                  <a href="https://www.congoresearchgroup.org/" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>Congo Research Group (Structural Studies)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://www.thenewhumanitarian.org/dr-congo" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>The New Humanitarian (Crisis Timelines)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                                <li>
                                  <a href="https://friendsofthecongo.org" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 flex items-center justify-between group py-0.5">
                                    <span>Friends of the Congo (Advocacy Network)</span>
                                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* 3. AUDIO VISUAL DOSSIERS: PEOPLE POWER VIDEOS */}
                        <div className="bg-white border-2 border-[#7a1f2b]/40 p-5 rounded shadow-lg">
                          <h4 className="font-serif font-black text-base text-stone-900 pb-2 border-b border-[#7a1f2b]/30 mb-4 uppercase tracking-wide flex items-center gap-1.5">
                            <Film size={15} className="text-[#9b2c3b]" />
                            People Power Dossier
                          </h4>
                          <p className="text-[11px] font-sans text-stone-700 leading-normal mb-4">
                            Selected broadcasts showcasing verified civilian mobilizations, student boycotts, and mass political demonstrations holding global governments accountable:
                          </p>
                          
                          {/* Video Links */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="font-mono text-[9px] text-[#7a1f2b] font-black uppercase">• GLOBAL MASS ACTION: PEOPLE'S DISPATCH</p>
                              <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                                International media project highlighting global grassroots mobilizations, union direct actions, and massive popular demonstrations standing in solidarity against genocide and military occupation.
                              </p>
                              <a 
                                href="https://peoplesdispatch.org" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7a1f2b]/20 hover:bg-[#7a1f2b]/40 text-[#6a1a26] border border-[#7a1f2b]/40 text-[10px] font-mono tracking-wider uppercase font-black transition-all rounded mt-1 shadow-sm"
                              >
                                <span>People's Dispatch</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>

                            <div className="space-y-2 border-t border-[#7a1f2b]/20 pt-4">
                              <p className="font-mono text-[9px] text-[#7a1f2b] font-black uppercase">• INDEPENDENT DISPATCH: THE ELECTRONIC INTIFADA</p>
                              <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                                Live news feeds, independent investigative broadcasts, and deep structural analysis of West Asian and global solidarity movements.
                              </p>
                              <a 
                                href="https://electronicintifada.net" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7a1f2b]/20 hover:bg-[#7a1f2b]/40 text-[#6a1a26] border border-[#7a1f2b]/40 text-[10px] font-mono tracking-wider uppercase font-black transition-all rounded mt-1 shadow-sm"
                              >
                                <span>Electronic Intifada</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    // Filtered Catalogue view grid
                    <div className="space-y-6">
                      <h3 className="font-mono text-xs font-bold uppercase tracking-widest border-b border-[#7a1f2b]/30 pb-2 text-stone-900">
                        Filtered Dispatches in Ceylon Stream
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map(art => (
                          <ArticleCard 
                            key={art.id}
                            article={art} 
                            author={writers.find(w => w.id === art.authorId)} 
                            onReadMore={handleReadMore} 
                            isBookmarked={bookmarks.includes(art.id)} 
                            onToggleBookmark={handleToggleBookmark} 
                            variant="grid"
                            isAdmin={effectiveAdminMode}
                            onDelete={handleDeleteArticle}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* HOVERING PAST CHANNELS */}
          {activeTab === 'past' && (
            <div className="max-w-7xl mx-auto px-4 mt-8" id="viewport-past">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-[#7a1f2b]/35 bg-white rounded max-w-4xl mx-auto" id="fallback-no-match">
                  <p className="font-serif text-xl italic text-stone-600">"Our archival books do not house releases matching these constraints."</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                    className="mt-6 font-mono text-xs font-bold uppercase tracking-widest bg-[#7a1f2b] text-white px-4 py-2 hover:bg-[#9b2c3b] transition-colors cursor-pointer rounded"
                  >
                    Reset Catalogue Query
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="past-archive-layout">
                  {/* Left Column */}
                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="font-mono text-xs font-black uppercase tracking-widest border-b border-[#7a1f2b]/30 pb-2 text-stone-900">
                      Historical Ledger Releases
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredArticles.map(art => (
                        <ArticleCard 
                          key={art.id}
                          article={art} 
                          author={writers.find(w => w.id === art.authorId)} 
                          onReadMore={handleReadMore} 
                          isBookmarked={bookmarks.includes(art.id)} 
                          onToggleBookmark={handleToggleBookmark} 
                          variant="grid"
                          isAdmin={effectiveAdminMode}
                          onDelete={handleDeleteArticle}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l-2 border-[#7a1f2b]/30 pt-8 lg:pt-0 lg:pl-8 space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white border-2 border-[#7a1f2b]/40 p-5 rounded shadow-lg">
                      <h4 className="font-serif font-black text-sm text-stone-900 mb-2 uppercase tracking-wide">Archival Ledger Advisory</h4>
                      <p className="font-sans text-xs text-stone-700 leading-relaxed mb-4">
                        Archive records cover investigative, societal trends, and historical legal commentaries of past years. Dispatches remain fully open to academic critique and commentaries.
                      </p>
                      <div className="text-xs font-mono text-[#6a1a26] flex items-center gap-1 font-bold">
                        <span>Total copies in library: {articles.filter(a => !a.isCurrent).length} items</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-mono text-xs font-black uppercase tracking-widest border-b border-[#7a1f2b]/30 pb-2 text-stone-900">
                        Active Current Coverage
                      </h3>
                      <div className="divide-y divide-[#7a1f2b]/20 space-y-2">
                        {articles.filter(a => a.isCurrent).slice(0, 3).map(art => (
                          <ArticleCard 
                            key={art.id}
                            article={art} 
                            author={writers.find(w => w.id === art.authorId)} 
                            onReadMore={handleReadMore} 
                            isBookmarked={bookmarks.includes(art.id)} 
                            onToggleBookmark={handleToggleBookmark} 
                            variant="sidebar"
                            isAdmin={effectiveAdminMode}
                            onDelete={handleDeleteArticle}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDITORIAL REPORTERS HUB */}
          {activeTab === 'writer' && (
            <div id="viewport-writer">
              {isAuthorizedEditor && (
                <div className="max-w-7xl mx-auto px-4 pb-2 flex justify-end">
                  <button
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className={`flex items-center gap-1.5 font-mono text-[10px] font-black uppercase py-1 px-2 border-2 transition-all cursor-pointer rounded ${
                      effectiveAdminMode 
                        ? 'bg-[#7a1f2b] text-white border-[#9b2c3b] shadow-md' 
                        : 'bg-stone-100 border-[#7a1f2b]/40 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    id="admin-moderator-desk"
                  >
                    <Shield size={10} />
                    {effectiveAdminMode ? 'Desk Mode: Active' : 'Sovereign Desk Authorization'}
                  </button>
                </div>
              )}
              <WriterProfileView 
                writers={writers} 
                articles={articles}
                onAddNewArticle={handleAddNewArticle} 
                onReadArticle={handleReadMore}
                onAddNewWriter={handleAddNewWriter}
                onUpdateWriter={handleUpdateWriter}
                onDeleteWriter={handleDeleteWriter}
                isAdmin={effectiveAdminMode}
              />
            </div>
          )}

          {/* MEDIA AND EVENTS HUB */}
          {activeTab === 'media' && (
            <MediaHub isAdmin={effectiveAdminMode} />
          )}

          {/* PRIVACY DEFENSE POLICY TAB */}
          {activeTab === 'privacy' && (
            <div id="viewport-privacy" className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
              <div className="bg-white border-2 border-[#7a1f2b]/40 p-6 md:p-12 relative shadow-xl rounded select-all font-sans text-stone-900">
                {/* Header Stamp */}
                <div className="text-center space-y-3 border-b-2 border-[#7a1f2b] pb-6 mb-8">
                  <span className="font-mono text-xs font-black tracking-[0.2em] text-[#7a1f2b] uppercase">
                    The Ceylon Review
                  </span>
                  <p className="font-mono text-[9px] text-stone-500 tracking-widest uppercase italic leading-none">
                    Independent. Rigorous. Accountable.
                  </p>
                  
                  <h3 className="font-serif text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-normal pt-2">
                    PRIVACY DEFENCE POLICY
                  </h3>
                  
                  <p className="font-mono text-[10px] md:text-xs text-stone-600 uppercase font-bold tracking-wider max-w-2xl mx-auto">
                    Digital Newsroom Operations — Source Protection, Data Security & Editorial Safety
                  </p>
                  
                  <div className="pt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-stone-500 font-bold uppercase border-t border-[#7a1f2b]/30 mt-4">
                    <span>Effective Date: June 2026</span>
                    <span>•</span>
                    <span>Version 1.0</span>
                    <span>•</span>
                    <span>Issued by the Office of the Chief Editor</span>
                  </div>
                </div>

                {/* Policy Body */}
                <div className="space-y-8 text-stone-900 leading-relaxed text-sm md:text-[15px] select-all">
                  
                  {/* SECTION 1 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      1. Preamble & Editorial Commitment
                    </h4>
                    <p>
                      The Ceylon Review is an independent digital publication committed to rigorous, accountable journalism on law, society, and public affairs in Sri Lanka. Operating in a legal and political environment where press freedom remains fragile, this publication recognises that privacy is not merely a technical concern — it is a foundational condition for free journalism.
                    </p>
                    <p>
                      This Privacy Defence Policy establishes the standards, protocols, and obligations that govern how The Ceylon Review collects, handles, and protects information relating to its sources, contributors, readers, and staff. It is informed by internationally recognised principles of journalist safety, including guidance from Reuters, the Committee to Protect Journalists (CPJ), and Reporters Without Borders (RSF).
                    </p>
                  </div>

                  {/* SECTION 2 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      2. Source Protection
                    </h4>
                    <p>
                      The protection of confidential sources is an absolute editorial obligation. No source who communicates with The Ceylon Review under an expectation of confidentiality shall be identified, exposed, or placed at risk through any act or omission by this publication.
                    </p>
                    
                    <div className="pl-4 md:pl-6 space-y-4 border-l-2 border-[#7a1f2b]/30">
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          2.1 Operational Principles
                        </h5>
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>Sources are never identified in published content without explicit, informed written consent.</li>
                          <li>Identity details, communications metadata, and contact information of sources are not stored on standard cloud services or unencrypted devices.</li>
                          <li>Editors and contributors are prohibited from discussing source identities in unsecured digital environments, including standard email and social media platforms.</li>
                          <li>The burden of source protection extends beyond publication — it applies to notes, drafts, device storage, and verbal communication.</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          2.2 Secure Communication Channels
                        </h5>
                        <p className="text-stone-600 italic">
                          The Ceylon Review uses and recommends the following for source communications:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>Signal (end-to-end encrypted messaging) — preferred for real-time contact with sources.</li>
                          <li>ProtonMail or Tutanota — for encrypted email correspondence.</li>
                          <li>SecureDrop — to be implemented as the publication scales, for anonymous document submission.</li>
                          <li>In-person meetings in non-surveilled locations for highest-sensitivity disclosures.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      3. Digital Security Standards
                    </h4>
                    <p>
                      All staff, contributors, and freelancers working with The Ceylon Review are required to adhere to the following minimum digital security standards.
                    </p>
                    
                    <div className="pl-4 md:pl-6 space-y-4 border-l-2 border-[#7a1f2b]/30">
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          3.1 Device & Account Security
                        </h5>
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>Full-disk encryption must be enabled on all devices used for editorial work.</li>
                          <li>Strong, unique passwords and two-factor authentication (2FA) are mandatory for all publication-related accounts.</li>
                          <li>Personal and editorial accounts must not be commingled on the same device without a VPN and compartmentalisation.</li>
                          <li>Devices must be locked immediately when unattended, particularly in public or hostile environments.</li>
                          <li>Lost or compromised devices must be reported to the Chief Editor immediately for remote wipe procedures.</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          3.2 Network & Browsing Security
                        </h5>
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>Editorial research and communication must be conducted over a trusted VPN, particularly on public Wi-Fi.</li>
                          <li>The Tor Browser is recommended for research into sensitive subjects where anonymity is necessary.</li>
                          <li>Staff should be alert to phishing attempts, including spear-phishing targeting journalists.</li>
                          <li>DNS-over-HTTPS should be enabled on all editorial devices to prevent traffic interception.</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          3.3 Data Minimisation
                        </h5>
                        <p>
                          The Ceylon Review operates on a principle of data minimisation: we collect only the information necessary for the journalistic purpose at hand. Unnecessary retention of personal data — particularly that of sources and subjects — is actively discouraged. Raw notes and drafts containing sensitive identifying information must be securely deleted once the editorial process is complete and no legal hold applies.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      4. Reader Data & Website Privacy
                    </h4>
                    <p>
                      The Ceylon Review's digital platform is designed with reader privacy as a default, not an afterthought.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>No third-party behavioural tracking scripts (e.g. Facebook Pixel, Google Ads trackers) are deployed on the publication's website.</li>
                      <li>Analytics, where used, are privacy-preserving (e.g. Plausible or Matomo self-hosted) and do not identify individual users.</li>
                      <li>Reader email addresses collected for newsletters are stored securely, never sold or shared with third parties, and subject to a clear unsubscribe mechanism.</li>
                      <li>Comment systems and engagement tools are evaluated for privacy implications before deployment.</li>
                      <li>HTTPS is enforced across all publication pages without exception.</li>
                    </ul>
                  </div>

                  {/* SECTION 5 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      5. Legal Threat Response & Anti-SLAPP Protocol
                    </h4>
                    <p>
                      The Ceylon Review recognises that legal intimidation — including Strategic Lawsuits Against Public Participation (SLAPPs) — is increasingly weaponised against independent media in Sri Lanka and globally. This section establishes protocols for responding to legal threats without compromising editorial integrity or source safety.
                    </p>
                    
                    <div className="pl-4 md:pl-6 space-y-4 border-l-2 border-[#7a1f2b]/30">
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          5.1 Upon Receipt of a Legal Threat or Demand
                        </h5>
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>All legal notices must be immediately referred to the Chief Editor and retained securely.</li>
                          <li>No editorial content shall be removed or altered in response to a legal threat without legal review and an editorial decision.</li>
                          <li>Sources implicated in any legal demand shall be notified as quickly as safely possible.</li>
                          <li>The publication will not disclose source identities in response to any demand — legal, governmental, or otherwise — without a binding court order issued by a competent Sri Lankan or international court, and even then only after exhausting all legal challenges.</li>
                          <li>Legal proceedings against the publication will be documented transparently and reported on where appropriate.</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          5.2 Document & Evidence Preservation
                        </h5>
                        <p>
                          In anticipation of potential legal proceedings, editorial teams must maintain secure backups of published materials, correspondence relevant to contested stories, and records of editorial decisions. These are to be stored in encrypted, access-controlled environments separate from day-to-day working files.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      6. Physical & Operational Safety
                    </h4>
                    <p>
                      Digital security and physical safety are inseparable. Journalists covering sensitive subjects — including political accountability, human rights, and security sector conduct — must assess physical risks alongside digital ones.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Contributors covering protests, court proceedings, or confrontational subjects should inform a trusted contact of their location and expected check-in times.</li>
                      <li>Devices carried into high-risk environments should contain minimal sensitive data ('travel clean' practice).</li>
                      <li>Journalists should be aware of surveillance risks including CCTV, vehicular tracking, and in-person monitoring.</li>
                      <li>The Chief Editor maintains a confidential incident log for any reported security incidents involving staff or contributors.</li>
                      <li>The Ceylon Review will not require or pressure contributors to undertake assignments that pose unreasonable personal risk.</li>
                    </ul>
                  </div>

                  {/* SECTION 7 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      7. Contributor Obligations & Training
                    </h4>
                    <p>
                      All contributors — staff, freelance, or volunteer — are required to read, understand, and agree to this Privacy Defence Policy before undertaking work for The Ceylon Review.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Contributors must not use personal or employer-provided devices for editorial work without adopting the security standards outlined in Section 3.</li>
                      <li>Contributors must report any suspected compromise of devices, accounts, or communications to the Chief Editor immediately.</li>
                      <li>The publication will provide access to basic digital security training resources and, where possible, facilitate training sessions for the editorial team.</li>
                      <li>Contributors are encouraged to use pseudonyms for sensitive reporting where their personal safety may be at risk, with the real identity known only to the Chief Editor.</li>
                    </ul>
                  </div>

                  {/* SECTION 8 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      8. Governing Legal & Ethical Framework
                    </h4>
                    <p>
                      This policy is informed by and seeks to operate consistently with the following frameworks and instruments:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Sri Lanka's Personal Data Protection Act No. 9 of 2022.</li>
                      <li>The International Principles on the Application of Human Rights to Communications Surveillance (Necessary & Proportionate Principles).</li>
                      <li>UN General Assembly Resolution 68/163 on the Safety of Journalists.</li>
                      <li>The Johannesburg Principles on National Security, Freedom of Expression, and Access to Information.</li>
                      <li>UNESCO's Journalist Safety Indicators and the Committee to Protect Journalists (CPJ) Digital Safety guidelines.</li>
                    </ul>
                  </div>

                  {/* SECTION 9 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      9. Policy Review
                    </h4>
                    <p>
                      This policy shall be reviewed annually by the Chief Editor, or immediately upon any material change in the publication's operating environment, applicable law, or following any significant security incident. Amendments will be recorded with version numbers and effective dates.
                    </p>
                  </div>

                </div>

                {/* Footer Signature Block */}
                <div className="mt-12 pt-6 border-t-2 border-dashed border-[#7a1f2b]/30 text-center font-mono">
                  <p className="text-xs text-stone-500">This policy is issued under the authority of the Chief Editor, The Ceylon Review.</p>
                  <p className="font-serif text-lg font-black text-[#7a1f2b] mt-2">{editorName} — Founder & Chief Editor</p>
                  <p className="text-[10px] text-stone-500 mt-1">The Ceylon Review | June 2026</p>
                  <div className="w-12 h-[2px] bg-[#7a1f2b] mx-auto mt-4" />
                  <p className="text-[9px] text-stone-500 italic mt-3 tracking-wider">
                    The Ceylon Review — Everything is connected. Nothing is neutral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REGULATORY DIRECTIVE TAB */}
          {activeTab === 'directive' && (
            <div id="viewport-directive" className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
              <div className="bg-white border-2 border-[#7a1f2b]/40 p-6 md:p-12 relative shadow-xl rounded select-all font-sans text-stone-900">
                {/* Header Stamp */}
                <div className="text-center space-y-3 border-b-2 border-[#7a1f2b] pb-6 mb-8">
                  <span className="font-mono text-xs font-black tracking-[0.2em] text-[#7a1f2b] uppercase">
                    The Ceylon Review
                  </span>
                  <p className="font-mono text-[9px] text-stone-500 tracking-widest uppercase italic leading-none">
                    Independent. Rigorous. Accountable.
                  </p>
                  
                  <h3 className="font-serif text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-normal pt-2">
                    REGULATORY DIRECTIVE
                  </h3>
                  
                  <p className="font-mono text-[10px] md:text-xs text-stone-600 uppercase font-bold tracking-wider max-w-2xl mx-auto">
                    Sovereign Press Compliance — Constitutional Safeguards, Editorial Independence & Universal Recourse
                  </p>
                  
                  <div className="pt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-stone-500 font-bold uppercase border-t border-[#7a1f2b]/30 mt-4">
                    <span>Effective Date: June 2026</span>
                    <span>•</span>
                    <span>Document Reference: SRD-2026-V1</span>
                    <span>•</span>
                    <span>Endorsed by the Sovereign Editorial Council</span>
                  </div>
                </div>

                {/* Directive Body */}
                <div className="space-y-8 text-stone-900 leading-relaxed text-sm md:text-[15px] select-all">
                  
                  {/* SECTION 1 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      1. Constitutional Authority & Scope
                    </h4>
                    <p>
                      This Regulatory Directive is issued by the Sovereign Editorial Council of The Ceylon Review. It outlines the regulatory obligations, constitutional references, and civil accountability metrics under which this publication exercises its journalism.
                    </p>
                    <p>
                      The Ceylon Review operates in absolute compliance with Section 14(1)(a) of the Constitution of the Democratic Socialist Republic of Sri Lanka, which secures the freedom of speech, expression, and publication. We reject any administrative pre-censorship or unconstitutional licensing regimes that impair the public's inherent right to access clean, uncorrupted, and critical information.
                    </p>
                  </div>

                  {/* SECTION 2 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      2. Code of Editorial Conduct
                    </h4>
                    <p>
                      Our primary allegiance is to the truth and the public interest. Every investigative dispatch and legal opinion published on our grids must adhere to the highest international standards of verification.
                    </p>
                    <div className="pl-4 md:pl-6 space-y-4 border-l-2 border-[#7a1f2b]/30">
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          2.1 Verification & Cross-Referencing
                        </h5>
                        <p>
                          No serious allegation of state corruption, legislative malpractice, or structural human rights abuse shall be broadcast without meticulous cross-referencing against primary sources, including judicial dockets, parliamentary registers, and certified archives.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-serif font-bold text-base text-stone-900">
                          2.2 Non-Partisanship & Public Sovereignty
                        </h5>
                        <p>
                          The Ceylon Review accepts no corporate sponsorships or government stipends. Our editorial voice remains entirely self-funded and separate from political coalitions or special interests. Everything is connected. Nothing is neutral.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg md:text-xl font-bold border-b border-[#7a1f2b]/30 pb-1.5 text-[#7a1f2b]">
                      3. Right of Correction & Public Recourse
                    </h4>
                    <p>
                      We acknowledge that the power of the press must coexist with immediate avenues of accountability. If any citizen, public official, or collective demonstrates that a broadcast dispatch is factually erroneous or contains material misrepresentations, this publication commits to a swift and prominent correction.
                    </p>
                    <p>
                      Requests for corrections, analytical rebuttals, or citizen dispatches can be submitted directly via our encrypted digital channels at <strong>theceylonreview@proton.me</strong>.
                    </p>
                  </div>

                </div>

                {/* Footer Signature Block */}
                <div className="mt-12 pt-6 border-t-2 border-dashed border-[#7a1f2b]/30 text-center font-mono">
                  <p className="text-xs text-stone-500">This directive is issued under the authority of the Sovereign Editorial Council.</p>
                  <p className="font-serif text-lg font-black text-[#7a1f2b] mt-2">{editorName} — Founder & Chief Editor</p>
                  <p className="text-[10px] text-stone-500 mt-1">The Ceylon Review | June 2026</p>
                  <div className="w-12 h-[2px] bg-[#7a1f2b] mx-auto mt-4" />
                  <p className="text-[9px] text-stone-500 italic mt-3 tracking-wider">
                    The Ceylon Review — Everything is connected. Nothing is neutral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT & CORRECTIONS TAB */}
          {activeTab === 'about' && (
            <div id="viewport-about" className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
              <div className="bg-white border-2 border-[#7a1f2b]/40 p-6 md:p-12 shadow-xl rounded font-sans text-stone-900">
                <div className="text-center space-y-2 border-b-2 border-[#7a1f2b] pb-4 mb-8">
                  <h2 className="font-serif text-3xl md:text-5xl font-black text-[#7a1f2b] uppercase tracking-wider">About & Corrections</h2>
                  <p className="font-mono text-[10px] md:text-xs text-stone-500 uppercase tracking-widest italic">The Ceylon Review, Colombo</p>
                </div>
                <div className="space-y-8 text-stone-900 leading-relaxed text-sm md:text-[15px]">
                  <div className="space-y-2">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">Who publishes this</h4>
                    <p>The Ceylon Review is an independent publication on law, human rights and global justice, founded in July 2026 and edited from Colombo by Sameera Mahboobdeen, Founder and Editorial Director.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">How we work</h4>
                    <p>We report facts and attribute them. Where we rely on a court ruling, a statute, a United Nations body or a rights organisation, we say which and link or name the source. Where we could not verify something, we say so, or leave it out. Opinion is labelled as opinion.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">Corrections</h4>
                    <p>If you believe something we published is wrong, write to <a href="mailto:theceylonreview@proton.me?subject=Correction%20request" className="underline text-[#6a1a26] font-bold">theceylonreview@proton.me</a> with the article title, the sentence, and what you say is correct, with a source if you have one. We check every request. When we find an error, we fix it, and for any change that affects meaning we add a dated note to the article saying what was changed.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">Right of reply</h4>
                    <p>People and organisations named in our reporting may send a response to the same address. We will consider publishing it alongside the article.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">Contact</h4>
                    <p>Editorial, corrections and column pitches: <a href="mailto:theceylonreview@proton.me" className="underline text-[#6a1a26] font-bold">theceylonreview@proton.me</a></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISCLAIMER NOTICE TAB */}
          {activeTab === 'disclaimer' && (
            <div id="viewport-disclaimer" className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
              <div className="bg-white border-2 border-[#7a1f2b]/40 p-6 md:p-12 relative shadow-xl rounded select-all font-sans text-stone-900">
                {/* Header Stamp */}
                <div className="text-center space-y-2 border-b-2 border-[#7a1f2b] pb-4 mb-8">
                  <h2 className="font-serif text-3xl md:text-5xl font-black text-[#7a1f2b] uppercase tracking-wider">
                    THE CEYLON REVIEW
                  </h2>
                  <h3 className="font-sans text-lg md:text-xl font-bold text-stone-900 tracking-widest uppercase">
                    DISCLAIMER
                  </h3>
                  <p className="font-mono text-[10px] md:text-xs text-stone-500 uppercase tracking-widest italic">
                    Last Updated: June 2026
                  </p>
                </div>

                {/* Disclaimer Body */}
                <div className="space-y-8 text-stone-900 leading-relaxed text-sm md:text-[15px] select-all">
                  
                  {/* GENERAL */}
                  <div className="space-y-2">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      GENERAL
                    </h4>
                    <p className="text-justify">
                      The Ceylon Review is an independent digital news and commentary platform. The content published on this platform — including but not limited to articles, opinion pieces, analyses, reports, and multimedia — represents the views of the respective authors and contributors, and does not necessarily reflect the official position of The Ceylon Review, its editors, or its management.
                    </p>
                  </div>

                  {/* EDITORIAL INDEPENDENCE */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      EDITORIAL INDEPENDENCE
                    </h4>
                    <p className="text-justify">
                      The Ceylon Review operates as a fully independent media outlet. We are not affiliated with, funded by, or editorially influenced by any government, political party, corporate entity, religious institution, or foreign organization. All editorial decisions are made independently in the public interest.
                    </p>
                  </div>

                  {/* OPINION & COMMENTARY */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      OPINION & COMMENTARY
                    </h4>
                    <p className="text-justify">
                      Opinion articles, columns, analyses, and commentary published on this platform are the sole views of the individual authors. They do not constitute the editorial stance of The Ceylon Review. Readers are encouraged to engage critically and consult multiple sources before forming conclusions.
                    </p>
                  </div>

                  {/* REPORTING ON SENSITIVE ISSUES */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      REPORTING ON SENSITIVE ISSUES
                    </h4>
                    <p className="text-justify">
                      The Ceylon Review covers global issues including but not limited to humanitarian crises, armed conflicts, apartheid, genocide, forced displacement, systemic discrimination, and social justice movements. Our reporting is guided by journalistic principles of accuracy, fairness, and public interest. We aim to amplify marginalized voices and hold power accountable.
                    </p>
                    <p className="text-justify">
                      Coverage of such issues is undertaken with the intent to inform the public and foster open discourse — not to incite violence, hatred, or discrimination against any individual, group, community, ethnicity, religion, or nationality.
                    </p>
                  </div>

                  {/* NO INCITEMENT */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      NO INCITEMENT
                    </h4>
                    <p className="text-justify">
                      The Ceylon Review unequivocally condemns violence, hate speech, and any form of discrimination. Nothing published on this platform should be construed as endorsing, encouraging, or inciting unlawful acts, violence, harassment, or hostility toward any person or group. Any content found to be in violation of this principle will be reviewed and addressed promptly.
                    </p>
                  </div>

                  {/* ACCURACY & CORRECTIONS */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      ACCURACY & CORRECTIONS
                    </h4>
                    <p className="text-justify">
                      While we strive for accuracy in all our reporting, The Ceylon Review does not warrant that all information published is complete, current, or free from error. We are committed to issuing corrections transparently and promptly when errors are identified. Readers who identify factual inaccuracies are encouraged to contact us at <a href="mailto:theceylonreview@proton.me" className="underline text-[#6a1a26] hover:text-stone-900">theceylonreview@proton.me</a>.
                    </p>
                  </div>

                  {/* THIRD-PARTY LINKS & SOURCES */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      THIRD-PARTY LINKS & SOURCES
                    </h4>
                    <p className="text-justify">
                      This platform may contain links to third-party websites, sources, or resources for reference and informational purposes. The Ceylon Review does not endorse, control, or take responsibility for the content, accuracy, or practices of any third-party sites. Accessing such links is at the reader's own discretion.
                    </p>
                  </div>

                  {/* USER-GENERATED CONTENT & COMMENTS */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      USER-GENERATED CONTENT & COMMENTS
                    </h4>
                    <p className="text-justify">
                      Comments, submissions, and other user-generated content published on this platform represent the views of the individual contributors alone. The Ceylon Review reserves the right to moderate, edit, or remove any content that violates our community standards, including content that is defamatory, hateful, obscene, or unlawful. We are not liable for content submitted by third parties.
                    </p>
                  </div>

                  {/* NO PROFESSIONAL ADVICE */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      NO PROFESSIONAL ADVICE
                    </h4>
                    <p className="text-justify">
                      Nothing on this platform constitutes legal, medical, financial, psychological, or any other form of professional advice. Content is provided for general informational and journalistic purposes only. Readers should seek appropriate professional guidance for specific concerns.
                    </p>
                  </div>

                  {/* INTELLECTUAL PROPERTY */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      INTELLECTUAL PROPERTY
                    </h4>
                    <p className="text-justify">
                      All original content published by The Ceylon Review — including text, graphics, design, and multimedia — is the intellectual property of The Ceylon Review or the respective contributors, and is protected under applicable copyright laws. Reproduction, redistribution, or republication of our content without prior written permission is prohibited, except for fair use purposes such as quotation with attribution.
                    </p>
                  </div>

                  {/* JURISDICTION */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      JURISDICTION
                    </h4>
                    <p className="text-justify">
                      This platform is operated from Sri Lanka and is subject to the laws of Sri Lanka. However, as a globally accessible digital publication, we acknowledge our responsibility to international standards of press freedom, human rights reporting, and ethical journalism as outlined by bodies such as the United Nations and the International Federation of Journalists (IFJ).
                    </p>
                  </div>

                  {/* CHANGES TO THIS DISCLAIMER */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      CHANGES TO THIS DISCLAIMER
                    </h4>
                    <p className="text-justify">
                      The Ceylon Review reserves the right to update or revise this disclaimer at any time without prior notice. Continued use of this platform constitutes acceptance of the most current version of this disclaimer.
                    </p>
                  </div>

                  {/* CONTACT */}
                  <div className="space-y-2 pt-2 border-t border-[#7a1f2b]/20">
                    <h4 className="font-sans text-xs font-black tracking-[0.1em] text-[#7a1f2b] uppercase">
                      CONTACT
                    </h4>
                    <p className="text-justify">
                      For queries, corrections, or legal correspondence, please contact us at: Email: <a href="mailto:theceylonreview@proton.me" className="underline text-[#6a1a26] hover:text-stone-900">theceylonreview@proton.me</a>
                    </p>
                  </div>

                </div>

                {/* Footer Centerpiece Tagline */}
                <div className="mt-12 pt-6 border-t-2 border-dashed border-[#7a1f2b]/30 text-center font-serif">
                  <p className="italic text-base md:text-lg font-black text-[#7a1f2b] tracking-wide">
                    The Ceylon Review — Everything Is Connected. Nothing Is Neutral.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Broadside Footer */}
      <footer className="bg-[#14264a] text-white border-t-4 border-[#7a1f2b] py-12 select-all" id="newspaper-footer">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <h2 className="font-serif text-3xl font-black tracking-widest text-white uppercase">THE CEYLON REVIEW</h2>
          <p className="text-[11px] font-mono text-white/70 tracking-[0.25em] max-w-2xl mx-auto leading-normal uppercase">
            INDEPENDENT JOURNALISM • ANALYTICAL JURISPRUDENCE • COMMITTED TO ABSOLUTE TRUTH & SOVEREIGN PEOPLES
          </p>
          
          <div className="bg-white/10 border border-white/15 p-3 max-w-lg mx-auto rounded text-xs font-mono text-center flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-white/80">Contact and column pitches:</span>
            <a href="mailto:theceylonreview@proton.me" className="underline text-stone-900 font-bold hover:text-white/80">theceylonreview@proton.me</a>
          </div>

          <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-white/70">
            <span>© 2026 THE CEYLON REVIEW PRINT & INTERACTIVE REPRODUCTIONS INC. ALL RIGHTS PRESERVED.</span>
            <span className="flex flex-wrap justify-center gap-4 items-center">
              <span onClick={() => handleTabChange('about')} className="hover:text-white cursor-pointer hover:underline">ABOUT & CORRECTIONS</span>
              <span onClick={() => handleTabChange('directive')} className="hover:text-white cursor-pointer hover:underline">REGULATORY DIRECTIVE</span>
              <span onClick={() => handleTabChange('privacy')} className="hover:text-white cursor-pointer hover:underline">PRIVACY DEFENSE</span>
              <span onClick={() => handleTabChange('disclaimer')} className="hover:text-white cursor-pointer hover:underline">LIABILITY DISCLAIMER</span>
              {!currentUser ? (
                <button
                  onClick={handleEditorSignIn}
                  className="bg-white text-[#14264a] hover:bg-stone-200 px-3 py-1.5 rounded font-bold cursor-pointer uppercase tracking-wider transition-colors"
                  id="footer-editor-signin"
                >
                  EDITORIAL SIGN IN
                </button>
              ) : !isAuthorizedEditor ? (
                <button
                  onClick={signOutEditor}
                  className="hover:text-white cursor-pointer hover:underline uppercase"
                >
                  SIGN OUT
                </button>
              ) : null}
            </span>
          </div>
        </div>
      </footer>

      {/* PERSISTENT FULL DETAILED READER MODAL */}
      {openingLink && !selectedArticle && (
        <div className="fixed inset-0 z-[90] bg-white/90 flex items-center justify-center font-mono text-xs tracking-widest text-[#7a1f2b]">
          OPENING ARTICLE…
        </div>
      )}
      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          author={writers.find(w => w.id === selectedArticle.authorId)} 
          writers={writers}
          onClose={() => setSelectedArticle(null)} 
          isBookmarked={bookmarks.includes(selectedArticle.id)}
          onToggleBookmark={handleToggleBookmarkInModal}
          onLike={handleRecommendArticle}
          onAddComment={handleAddComment}
          isAdmin={effectiveAdminMode}
          onDeleteComment={handleDeleteComment}
          onEditArticle={handleEditArticle}
          onDeleteArticle={handleDeleteArticle}
        />
      )}

      {/* PERSISTENT SAVED CLIPPINGS DRAWER */}
      <BookmarksDrawer 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)} 
        bookmarkedArticles={bookmarkedArticlesList} 
        writers={writers} 
        onReadArticle={(art) => {
          setIsBookmarksOpen(false);
          handleReadMore(art);
        }} 
        onRemoveBookmark={(artId) => handleToggleBookmark(undefined, artId)}
      />

      {/* SOVEREIGN EDITORIAL DESK CMS DRAWER */}
      {isAuthorizedEditor && (
        <SovereignEditorialDesk 
          isOpen={isEditorialDeskOpen}
          onClose={() => setIsEditorialDeskOpen(false)}
          articles={articles}
          writers={writers}
          setArticles={setArticles}
          setWriters={setWriters}
          onAddNewArticle={handleAddNewArticle}
          onAddNewWriter={handleAddNewWriter}
          onEditArticle={handleEditArticle}
          onDeleteArticle={handleDeleteArticle}
          onDeleteWriter={handleDeleteWriter}
          onResetData={handleResetData}
          currentUser={currentUser}
          onSignInGoogle={handleEditorSignIn}
          onSignOutGoogle={async () => {
            await signOutEditor();
            setIsAdminMode(false);
            setIsEditorialDeskOpen(false);
          }}
        />
      )}

      {/* Floating CMS Control Desk Trigger Button */}
      {effectiveAdminMode && (
        <button
          onClick={() => setIsEditorialDeskOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#7a1f2b] hover:bg-[#8a2432] text-[#f5eedc] p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-mono text-[10px] font-black uppercase border-2 border-[#d4af37] cursor-pointer hover:scale-105 transition-all group"
          id="floating-cms-desk-trigger"
          title="Open Sovereign Editorial CMS Panel"
        >
          <Settings size={16} className="group-hover:rotate-45 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            CMS Editorial Desk
          </span>
        </button>
      )}

      {/* Visual In-App Notification Toast */}
      {toastNotification && (
        <div className="fixed bottom-6 left-6 z-50 bg-white text-stone-900 border-2 border-[#8a2432] p-4 rounded shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200 max-w-md ring-1 ring-[#d4af37]/30">
          <div className="p-2 bg-[#7a1f2b] text-white rounded shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <h5 className="font-serif font-black text-xs uppercase tracking-wider text-stone-900">Editorial Action Authorised</h5>
            <p className="font-sans text-xs text-stone-700 mt-0.5">{toastNotification}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-stone-600 hover:text-stone-900 p-1 ml-auto cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
