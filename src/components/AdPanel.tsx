import React from 'react';
import { ADS, ADVERTISE_EMAIL } from '../data/ads';

// Sidebar sponsor panel. Always labelled "Advertisement" so readers can tell it apart from editorial.
export default function AdPanel() {
  const subject = encodeURIComponent('Advertising enquiry - The Ceylon Review');
  const body = encodeURIComponent(
    'Hello,\n\nI would like to advertise on The Ceylon Review.\n\nName / organisation:\nWhat you want to promote:\nPreferred dates:\n\nThank you.'
  );

  return (
    <div className="bg-white border border-stone-300 rounded shadow-lg p-4" id="ad-panel">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3 text-center">
        Advertisement
      </p>

      {ADS.length > 0 ? (
        <div className="space-y-4">
          {ADS.map((ad) => (
            <a
              key={ad.id}
              href={ad.link}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="block group"
            >
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
    </div>
  );
}
