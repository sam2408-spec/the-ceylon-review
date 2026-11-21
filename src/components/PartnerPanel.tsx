import React from 'react';

const ADVERTISE_EMAIL = 'theceylonreview@proton.me';

// Sidebar advertisement panel with an "Advertise here" button.
export default function PartnerPanel() {
  const subject = encodeURIComponent('Advertising enquiry - The Ceylon Review');
  const body = encodeURIComponent(
    'Hello,\n\nI would like to advertise on The Ceylon Review.\n\nName / organisation:\nWhat you want to promote:\nPreferred dates:\n\nThank you.'
  );

  return (
    <div className="bg-white border border-stone-300 rounded shadow-lg p-4" id="support-box">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3 text-center">
        Advertisement
      </p>
      <div className="border-2 border-dashed border-stone-300 rounded p-6 text-center bg-stone-50">
        <p className="font-serif text-lg font-bold text-stone-800 leading-snug">Your message here</p>
        <p className="font-sans text-[11px] text-stone-600 mt-1">
          Reach readers who follow law, rights and public affairs in Sri Lanka.
        </p>
      </div>
      <a
        href={`mailto:${ADVERTISE_EMAIL}?subject=${subject}&body=${body}`}
        className="mt-4 block text-center bg-[#14264a] hover:bg-[#0c1a36] text-white font-sans text-xs font-bold uppercase tracking-widest py-2.5 rounded transition-colors"
        id="work-with-us"
      >
        Advertise here
      </a>
      <p className="mt-2 text-center font-sans text-[10px] text-stone-500 leading-snug">
        Advertisers have no say over our reporting.
      </p>
    </div>
  );
}
