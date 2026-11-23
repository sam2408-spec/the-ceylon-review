import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  Firestore
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Article, Writer } from './types';
import { INITIAL_ARTICLES, INITIAL_WRITERS } from './initialData';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('The client is currently offline. Using local cached editorial state.');
    }
  }
}
testConnection();

// Google Sign-In for Sovereign Editorial Authority
export async function signInEditorWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    // If running in an iframe or if the preview domain is not in Firebase Auth's Authorized Domains,
    // Google popup authentication throws auth/network-request-failed or auth/popup-blocked.
    const errCode = err?.code || '';
    const errMsg = err?.message || '';

    if (errCode === 'auth/network-request-failed' || errCode === 'auth/popup-blocked' || errCode === 'auth/unauthorized-domain') {
      console.warn('Google Sign-in popup blocked or origin unlisted by Firebase Auth domain security:', err);
    } else {
      console.error('Google Sign-in failed:', err);
    }
    throw err;
  }
}

export async function signOutEditor(): Promise<void> {
  await signOut(auth);
}

// Real-time Firestore Subscriptions
// Covers supplied after the articles were first stored. Applied for every visitor, so the new
// image shows without anyone having to sign in as editor. A cover the editor has set herself
// (anything other than the original stock photo) is never touched.
function withPublishedCovers(a: Article): Article {
  if (a.id === 'art-manufactured-silence' && a.imageUrl?.includes('images.unsplash.com')) {
    return { ...a, imageUrl: '/images/hasbara-flag.jpg' };
  }
  if (a.id === 'art-sunflower-circle-fundraiser' && a.authorId === 'w-sameera') {
    a = { ...a, authorId: 'w-1795423643302' };
  }
  if (a.id === 'art-sunflower-circle-fundraiser' && !a.content?.some((c) => c.includes('images/fundraiser/session-under-way'))) {
    const fresh = INITIAL_ARTICLES.find((x) => x.id === a.id);
    if (fresh) return { ...a, imageUrl: fresh.imageUrl, content: fresh.content };
  }
  if (a.id === 'art-saleh-aljafarawi' && a.content?.some((c) => c.startsWith('The Gaza Government Media Office is part of the administration'))) {
    const fresh = INITIAL_ARTICLES.find((x) => x.id === a.id)?.content.find((c) => c.startsWith('Whichever count is used'));
    if (fresh) {
      a = { ...a, content: a.content.map((c) => (c.startsWith('The Gaza Government Media Office is part of the administration') ? fresh : c)) };
    }
  }
  if (a.id === 'art-saleh-aljafarawi' && !a.imageUrl) {
    const fresh = INITIAL_ARTICLES.find((x) => x.id === a.id);
    if (fresh?.imageUrl) return { ...a, imageUrl: fresh.imageUrl };
  }
  if (a.id === 'art-colonial-law') {
    let out = a;
    const marker = '[[image:/images/psta-protest-parliament.jpg|A march near Parliament in Colombo on 4 November 2026. One placard reads “PSTA: Military Given Police Power.”]]';
    if (!a.content.some((c) => c.includes('psta-protest-parliament'))) {
      const i = a.content.findIndex((c) => c.startsWith('The Daily FT reported on 19 August'));
      if (i >= 0) {
        const content = [...a.content];
        content.splice(i + 1, 0, marker);
        out = { ...out, content };
      }
    }
    if (out.imageUrl?.includes('images.unsplash.com')) {
      out = { ...out, imageUrl: '/images/psta-protest-parliament.jpg' };
    }
    return out;
  }
  return a;
}

// Fetch one article directly (used by shared links so they open without waiting for the full list).
export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const snap = await getDocFromServer(doc(db, 'articles', id));
    if (snap.exists()) return withPublishedCovers(snap.data() as Article);
  } catch { /* fall through */ }
  const local = INITIAL_ARTICLES.find((a) => a.id === id);
  return local ? withPublishedCovers(local) : null;
}

export function subscribeToArticles(
  onData: (articles: Article[]) => void,
  onError?: (err: Error) => void
) {
  const articlesPath = 'articles';
  return onSnapshot(
    collection(db, articlesPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Article[] = [];
        snapshot.forEach((d) => {
          loaded.push(withPublishedCovers(d.data() as Article));
        });
        onData(loaded);
      } else {
        // Return empty so caller can seed if desired
        onData([]);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, articlesPath);
    }
  );
}

export function subscribeToWriters(
  onData: (writers: Writer[]) => void,
  onError?: (err: Error) => void
) {
  const writersPath = 'writers';
  return onSnapshot(
    collection(db, writersPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Writer[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Writer);
        });
        onData(loaded);
      } else {
        onData([]);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, writersPath);
    }
  );
}

// Mutations
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const path = `articles/${article.id}`;
  try {
    await setDoc(doc(db, 'articles', article.id), article);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateArticleInFirestore(articleId: string, fields: Partial<Article>): Promise<void> {
  const path = `articles/${articleId}`;
  try {
    await updateDoc(doc(db, 'articles', articleId), fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  const path = `articles/${articleId}`;
  try {
    await deleteDoc(doc(db, 'articles', articleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveWriterToFirestore(writer: Writer): Promise<void> {
  const path = `writers/${writer.id}`;
  try {
    await setDoc(doc(db, 'writers', writer.id), writer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWriterFromFirestore(writerId: string): Promise<void> {
  const path = `writers/${writerId}`;
  try {
    await deleteDoc(doc(db, 'writers', writerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed initial archives if Firestore is empty, and ensure non-Sameera profiles are purged
export async function seedInitialFirestoreArchives(): Promise<void> {
  try {
    const existingSnap = await getDocs(query(collection(db, 'articles')));
    if (existingSnap.empty) {
      for (const art of INITIAL_ARTICLES) {
        await setDoc(doc(db, 'articles', art.id), art);
      }
    }

    // One-time content refresh of the PTA article: only replaces the original
    // version, so any later edits made in the Editorial Desk are never overwritten.
    try {
      const ptaRef = doc(db, 'articles', 'art-colonial-law');
      const ptaSnap = await getDocFromServer(ptaRef);
      const fresh = INITIAL_ARTICLES.find(a => a.id === 'art-colonial-law');
      if (fresh && ptaSnap.exists()) {
        const cur = ptaSnap.data() as Article;
        if (cur.content?.[0]?.startsWith('There is a word that does more political work')) {
          await setDoc(ptaRef, {
            ...cur,
            title: fresh.title,
            subtitle: fresh.subtitle,
            summary: fresh.summary,
            content: fresh.content,
            publishedAt: fresh.publishedAt,
            readTime: fresh.readTime,
          });
        }
      }
    } catch (e) {
      console.warn('PTA article refresh skipped:', e);
    }

    // One-time add of newer articles: created only when missing, and only once
    // per browser, so an article the editor later deletes is not brought back.
    try {
      for (const art of INITIAL_ARTICLES) {
        if (art.id !== 'art-fergie-chambers' && art.id !== 'art-gaza-floods' && art.id !== 'art-sunflower-circle-fundraiser' && art.id !== 'art-saleh-aljafarawi') continue;
        const flag = 'seeded20:' + art.id;
        let done = false;
        try { done = localStorage.getItem(flag) === '1'; } catch { /* ignore */ }
        if (done) continue;
        const ref = doc(db, 'articles', art.id);
        const snap = await getDocFromServer(ref);
        if (!snap.exists()) {
          await setDoc(ref, art);
        } else {
          // Replace the first draft only (Chambers article); later edits in the Editorial Desk are kept.
          const cur = snap.data() as Article;
          if (art.id === 'art-saleh-aljafarawi') {
            const next = withPublishedCovers(cur);
            if (next !== cur) await setDoc(ref, next);
            try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
            continue;
          }
          if (art.id === 'art-sunflower-circle-fundraiser') {
            if (cur.authorId === 'w-sameera') {
              await setDoc(ref, { ...cur, authorId: art.authorId });
              cur.authorId = art.authorId;
            }
            if (!cur.content?.some(c => c.includes('images/fundraiser/session-under-way'))) {
              await setDoc(ref, { ...cur, imageUrl: art.imageUrl, content: art.content });
            }
            try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
            continue;
          }
          if (art.id === 'art-gaza-floods') {
            // Targeted corrections that keep any other edits made in the Editorial Desk.
            if (cur.content?.some(c => c.includes('All agree on five deaths at the sandbank collapse.') && !c.includes('took place on Sunday 8 November')) || cur.content?.some(c => c.includes('Al Jazeera reports.'))) {
              const fresh = art.content.find(c => c.includes('All agree on five deaths at the sandbank collapse.'));
              const freshSrc = art.content.find(c => c.startsWith('This article reports'));
              const next = cur.content.map(c => {
                if (c.includes('All agree on five deaths at the sandbank collapse.') && !c.includes('took place on Sunday 8 November') && fresh) return fresh;
                if (c.includes('Al Jazeera reports.')) return c.replace('Al Jazeera reports.', 'it is reported.');
                if (c.startsWith('This article reports') && !c.includes('Euronews') && freshSrc) return freshSrc;
                return c;
              });
              await setDoc(ref, { ...cur, content: next });
              cur.content = next;
            }
            if (!cur.content?.some(c => c.startsWith('[[image:')) || cur.content.some(c => c.includes('I could only read') || c.includes('(Al Jazeera)') || c.includes('LEGISLATIVE TIMELINE: THE FIRST') || c.startsWith('TIMELINE: THE FIRST'))) {
              await setDoc(ref, { ...cur, imageUrl: art.imageUrl, content: art.content });
            }
            try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
            continue;
          }
          if (cur.imageUrl?.includes('chambers-mistranslation')) {
            await setDoc(ref, { ...cur, imageUrl: art.imageUrl });
            cur.imageUrl = art.imageUrl;
          }
          if ((cur.content?.length === 1 && cur.content[0].startsWith('Lost in Translation')) || cur.content?.some(c => c.includes('first time in eleven years') || c.includes('no grand jury has ever'))) {
            await setDoc(ref, { ...cur, title: art.title, subtitle: art.subtitle, summary: art.summary, content: art.content });
          }
        }
        try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
      }
    } catch (e) {
      console.warn('New article seeding skipped:', e);
    }

    // Add the 4 November protest photo to the PTA article once, keeping any later edits.
    try {
      const ptaRef2 = doc(db, 'articles', 'art-colonial-law');
      const ptaSnap2 = await getDocFromServer(ptaRef2);
      const freshPta = INITIAL_ARTICLES.find(a => a.id === 'art-colonial-law');
      const marker = freshPta?.content.find(c => c.startsWith('[[image:/images/psta-protest'));
      if (ptaSnap2.exists() && marker) {
        const cur2 = ptaSnap2.data() as Article;
        if (!cur2.content?.some(c => c.includes('psta-protest-parliament'))) {
          const at = cur2.content.findIndex(c => c.startsWith('The Daily FT reported'));
          if (at >= 0) {
            const next = [...cur2.content];
            next.splice(at + 1, 0, marker);
            await setDoc(ptaRef2, { ...cur2, content: next });
          }
        }
      }
    } catch (e) {
      console.warn('PTA photo add skipped:', e);
    }

    // Hasbara article cover: swap the stock photo for the supplied image once; a custom cover is left alone.
    try {
      const hRef = doc(db, 'articles', 'art-manufactured-silence');
      const hSnap = await getDocFromServer(hRef);
      if (hSnap.exists()) {
        const h = hSnap.data() as Article;
        if (h.imageUrl && h.imageUrl.includes('images.unsplash.com')) {
          await setDoc(hRef, { ...h, imageUrl: '/images/hasbara-flag.jpg' });
        }
      }
    } catch (e) {
      console.warn('Hasbara cover update skipped:', e);
    }

    const writersSnap = await getDocs(query(collection(db, 'writers')));
    if (writersSnap.empty) {
      for (const w of INITIAL_WRITERS) {
        await setDoc(doc(db, 'writers', w.id), w);
      }
    } else {
      // Clean up any non-Sameera writers from Firestore (e.g., w-arjun, w-dilini)
      writersSnap.forEach(async (docSnap) => {
        const data = docSnap.data() as Writer;
        if (data.id !== 'w-sameera' && (data.id === 'w-arjun' || data.id === 'w-dilini' || data.name.toLowerCase().includes('arjun') || data.name.toLowerCase().includes('dilini'))) {
          try {
            await deleteDoc(doc(db, 'writers', docSnap.id));
          } catch (e) {
            console.warn('Could not delete old writer doc from Firestore:', e);
          }
        }
      });
      // Only seed Sameera if not already present in Firestore so custom profile pictures are preserved
      const hasSameera = writersSnap.docs.some(d => d.id === 'w-sameera');
      if (!hasSameera) {
        const sameeraWriter = INITIAL_WRITERS.find(w => w.id === 'w-sameera');
        if (sameeraWriter) {
          await setDoc(doc(db, 'writers', 'w-sameera'), sameeraWriter);
        }
      }
    }
  } catch (error) {
    console.warn('Initial seeding could not complete (might require editorial auth):', error);
  }
}

// ---- Event gallery (photos stored with each entry; see firestore.rules) ----
export interface GalleryEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  createdAt: string;
}

export function subscribeToEvents(
  onData: (events: GalleryEvent[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, 'events'),
    (snapshot) => {
      const loaded = snapshot.docs.map((d) => d.data() as GalleryEvent);
      loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(loaded);
    },
    (error) => {
      console.warn('Gallery events could not be loaded:', error);
      onError?.(error);
    }
  );
}

export async function saveEventToFirestore(event: GalleryEvent): Promise<void> {
  await Promise.race([
    setDoc(doc(db, 'events', event.id), event),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 25000)),
  ]);
}

export async function deleteEventFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}


// ---- Shared video dispatches (visible to every reader, editor-only changes) ----
export interface SharedVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  platform: 'YouTube' | 'Vimeo' | 'Other';
  publishedAt: string;
  likes: number;
  createdAt: string;
}

export function subscribeToVideos(
  onData: (videos: SharedVideo[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, 'videos'),
    (snapshot) => {
      const loaded = snapshot.docs.map((d) => d.data() as SharedVideo);
      loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(loaded);
    },
    (error) => {
      console.warn('Videos could not be loaded:', error);
      onError?.(error);
    }
  );
}

export async function saveVideoToFirestore(video: SharedVideo): Promise<void> {
  await Promise.race([
    setDoc(doc(db, 'videos', video.id), video),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 25000)),
  ]);
}

export async function deleteVideoFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'videos', id));
}


// ---- Sponsor advertisements (visible to every reader, editor-only changes) ----
export interface SharedAd {
  id: string;
  sponsor: string;
  image: string;
  link: string;
  caption?: string;
  createdAt: string;
}

export function subscribeToAds(onData: (ads: SharedAd[]) => void) {
  return onSnapshot(
    collection(db, 'ads'),
    (snapshot) => {
      const loaded = snapshot.docs.map((d) => d.data() as SharedAd);
      loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(loaded);
    },
    (error) => console.warn('Ads could not be loaded:', error)
  );
}

export async function saveAdToFirestore(ad: SharedAd): Promise<void> {
  await setDoc(doc(db, 'ads', ad.id), ad);
}

export async function deleteAdFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ads', id));
}
