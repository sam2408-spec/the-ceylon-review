import React, { useEffect, useState } from 'react';
import { ADVERTISE_EMAIL } from '../data/ads';
import { SharedAd, subscribeToAds, saveAdToFirestore, deleteAdFromFirestore } from '../firebase';

// Sidebar sponsor panel. Always labelled "Advertisement" so readers can tell it apart from editorial.
// Editors get a small form underneath to add or remove sponsors.
export default function AdPanel({ isAdmin = false }: { isAdmin?: boolean }) {
  const [ads, setAds] = useState<SharedAd[]>([]);
  const [sponsor, setSponsor] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToAds(setAds), []);

  const subject = encodeURIComponent('Advertising enquiry - The Ceylon Review');
  const body = encodeURIComponent(
    'Hello,\n\nI would like to advertise on The Ceylon Review.\n\nName / organisation:\nWhat you want to promote:\nPreferred dates:\n\nThank you.'
  );

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (!sponsor.trim()) return setMsg('Enter the sponsor name.');
    if (!/^https:\/\//i.test(image.trim())) return setMsg('Image address must start with https://');
    if (!/^https:\/\//i.test(link.trim())) return setMsg('Link must start with https://');
    setBusy(true);
    try {
      const id = `ad-${Date.now()}`;
      const ad: SharedAd = {
        id,
        sponsor: sponsor.trim(),
        image: image.trim(),
        link: link.trim(),
        createdAt: new Date().toISOString(),
        ...(caption.trim() ? { caption: caption.trim() } : {}),
      };
      await saveAdToFirestore(ad);
      setSponsor(''); setImage(''); setLink(''); setCaption('');
      setMsg('Sponsor added.');
    } catch {
      setMsg('Could not save. Make sure you are signed in as editor and the Firestore rules include the ads rule.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this sponsor?')) return;
    try { await deleteAdFromFirestore(id); } catch { setMsg('Could not remove it.'); }
  };

  return (
    <div className="bg-white border border-stone-300 rounded shadow-lg p-4" id="ad-panel">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3 text-center">
        Advertisement
      </p>

      {ads.length > 0 ? (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="relative">
              <a href={ad.link} target="_blank" rel="sponsored noopener noreferrer" className="block group">
                <img src={ad.image} alt={ad.sponsor} loading="lazy" className="w-full rounded border border-stone-200" />
                {ad.caption && (
                  <span className="block mt-2 font-sans text-[11px] text-stone-600 leading-snug group-hover:underline">
                    {ad.caption}
                  </span>
                )}
                <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-400 mt-1">
                  Sponsored by {ad.sponsor}
                </span>
              </a>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => remove(ad.id)}
                  className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#7a1f2b] underline cursor-pointer"
                >
                  Remove this sponsor
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-300 rounded p-6 text-center bg-stone-50">
          <p className="font-serif text-lg font-bold text-stone-800 leading-snug">Your message here</p>
          <p className="font-sans text-[11px] text-stone-600 mt-1">
            Reach readers who follow law, rights and public affairs in Sri Lanka.
          </p>
        </div>
      )}

      <a
        href={`mailto:${ADVERTISE_EMAIL}?subject=${subject}&body=${body}`}
        className="mt-4 block text-center bg-[#14264a] hover:bg-[#0c1a36] text-white font-sans text-xs font-bold uppercase tracking-widest py-2.5 rounded transition-colors"
        id="advertise-here"
      >
        Advertise here
      </a>
      <p className="mt-2 text-center font-sans text-[10px] text-stone-500 leading-snug">
        Advertisers have no say over our reporting.
      </p>

      {isAdmin && (
        <form onSubmit={add} className="mt-4 pt-4 border-t border-stone-200 space-y-2" id="ad-admin-form">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#7a1f2b] font-bold">Editor: add a sponsor</p>
          <input value={sponsor} onChange={(e) => setSponsor(e.target.value)} placeholder="Sponsor name" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image address (https://…)" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Where the ad links to (https://…)" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Short caption (optional)" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          <button type="submit" disabled={busy} className="w-full bg-[#7a1f2b] hover:bg-[#5e1620] text-white text-xs font-bold uppercase tracking-widest py-2 rounded cursor-pointer disabled:opacity-60">
            {busy ? 'Saving…' : 'Add sponsor'}
          </button>
          {msg && <p className="text-[11px] text-stone-700">{msg}</p>}
        </form>
      )}
    </div>
  );
}
