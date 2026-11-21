import React, { useEffect, useState } from 'react';
import { ADVERTISE_EMAIL } from '../data/ads';
import { SharedAd, subscribeToAds, saveAdToFirestore, deleteAdFromFirestore } from '../firebase';

// Sidebar sponsor panel. Always labelled "Advertisement" so readers can tell it apart from editorial.
// Editors get a small form underneath to add or remove sponsors.
export default function PartnerPanel({ isAdmin = false }: { isAdmin?: boolean }) {
  const [ads, setAds] = useState<SharedAd[]>([]);
  const [sponsor, setSponsor] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeToAds(setAds), []);

  const subject = encodeURIComponent('Advertising enquiry - The Ceylon Review');
  const body = encodeURIComponent(
    'Hello,\n\nI would like to advertise on The Ceylon Review.\n\nName / organisation:\nWhat you want to promote:\nPreferred dates:\n\nThank you.'
  );

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg('Please choose a JPG, PNG or WebP picture.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { setMsg('Could not read the picture.'); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL('image/jpeg', 0.82));
        setMsg('');
      };
      img.onerror = () => setMsg('Could not read the picture.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (!sponsor.trim()) return setMsg('Enter the sponsor name.');
    if (!image.trim()) return setMsg('Choose a picture or paste an image address.');
    if (!/^(https:\/\/|data:image\/)/i.test(image.trim())) return setMsg('Image address must start with https://');
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
    <div className="bg-white border border-stone-300 rounded shadow-lg p-4" id="support-box">
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
      ) : null}

      <button
        type="button"
        onClick={() => setShowContact((v) => !v)}
        className={`${ads.length > 0 ? "mt-4" : "mt-0"} block w-full text-center bg-[#14264a] hover:bg-[#0c1a36] text-white font-sans text-xs font-bold uppercase tracking-widest py-2.5 rounded transition-colors cursor-pointer`}
        id="work-with-us"
      >
        Advertise here
      </button>
      {showContact && (
        <div className="mt-3 border border-stone-300 rounded bg-stone-50 p-3 text-center space-y-2">
          <p className="font-sans text-[11px] text-stone-700 leading-snug">
            To advertise, write to us with who you are and what you want to promote.
          </p>
          <p className="font-mono text-xs font-bold text-stone-900 break-all select-all">{ADVERTISE_EMAIL}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${ADVERTISE_EMAIL}&su=${subject}&body=${body}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold uppercase tracking-wider bg-[#7a1f2b] text-white px-3 py-1.5 rounded"
            >
              Open in Gmail
            </a>
            <a
              href={`mailto:${ADVERTISE_EMAIL}?subject=${subject}&body=${body}`}
              className="text-[11px] font-bold uppercase tracking-wider border border-stone-400 text-stone-800 px-3 py-1.5 rounded"
            >
              Other email app
            </a>
            <button
              type="button"
              onClick={() => { try { navigator.clipboard.writeText(ADVERTISE_EMAIL); setCopied(true); } catch { /* ignore */ } }}
              className="text-[11px] font-bold uppercase tracking-wider border border-stone-400 text-stone-800 px-3 py-1.5 rounded cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy address'}
            </button>
          </div>
        </div>
      )}
      <p className="mt-2 text-center font-sans text-[10px] text-stone-500 leading-snug">
        Advertisers have no say over our reporting.
      </p>

      {isAdmin && (
        <form onSubmit={add} className="mt-4 pt-4 border-t border-stone-200 space-y-2" id="support-admin-form">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#7a1f2b] font-bold">Editor: add a sponsor</p>
          <input value={sponsor} onChange={(e) => setSponsor(e.target.value)} placeholder="Sponsor name" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          <label className="block text-[11px] text-stone-600">Picture from your computer</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickFile} className="w-full text-xs" />
          {image.startsWith('data:image/') && <img src={image} alt="Preview" className="w-full rounded border border-stone-200" />}
          {!image.startsWith('data:image/') && (
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="…or paste an image address (https://…)" className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs" />
          )}
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
