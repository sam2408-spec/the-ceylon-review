import React from 'react';
import { Instagram } from 'lucide-react';
import { SOCIAL_GROUPS } from '../data/socialHandles';

// "Follow the struggle" block shown under the front-page articles.
export default function SocialHandles() {
  return (
    <section className="rounded border border-stone-300 bg-white p-5 md:p-6 shadow-sm" id="social-handles">
      <h3 className="font-sans text-xs font-black uppercase tracking-[0.18em] text-[#7a1f2b] border-b-2 border-[#7a1f2b] pb-2 mb-4 flex items-center gap-2">
        <Instagram size={14} />
        Follow the struggle on Instagram
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {SOCIAL_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{g.title}</p>
            <ul className="space-y-1.5">
              {g.handles.map((h) => (
                <li key={h.handle}>
                  <a
                    href={`https://www.instagram.com/${h.handle}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline gap-2"
                  >
                    <span className="font-serif text-base font-bold text-stone-900 group-hover:underline">{h.name}</span>
                    <span className="font-mono text-[11px] text-[#7a1f2b]">@{h.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 font-sans text-[10px] text-stone-500 leading-snug">
        These are independent accounts. The Ceylon Review does not control them, and listing one does not mean we endorse every post.
      </p>
    </section>
  );
}
