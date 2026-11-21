import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { SOCIAL_GROUPS } from '../data/socialHandles';

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// "Follow the struggle" block shown under the front-page articles.
// Each account is a card that opens its Instagram profile in a new tab.
export default function SocialHandles() {
  return (
    <section className="rounded-lg bg-[#14264a] text-white p-5 md:p-7 shadow-lg" id="social-handles">
      <div className="flex items-center gap-3 mb-1">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9a03f] via-[#d62976] to-[#4f5bd5]">
          <Instagram size={18} className="text-white" />
        </span>
        <h3 className="font-serif text-2xl md:text-3xl font-black leading-tight">Follow the struggle</h3>
      </div>
      <p className="font-sans text-sm text-white/75 mb-6 max-w-2xl">
        Voices from the ground in Palestine, Sudan, Congo, the Rohingya community and Cuba, and the Sri Lankans standing with them.
      </p>

      <div className="space-y-6">
        {SOCIAL_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-3 flex items-center gap-3">
              <span>{g.title}</span>
              <span className="flex-1 h-px bg-white/15" />
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.handles.map((h) => (
                <li key={h.handle}>
                  <a
                    href={`https://www.instagram.com/${h.handle}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${h.name} on Instagram (opens in a new tab)`}
                    className="group flex items-center gap-3 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 hover:border-white/30 p-3 transition-all hover:-translate-y-0.5"
                  >
                    <span className="shrink-0 rounded-full p-[2.5px] bg-gradient-to-tr from-[#f9a03f] via-[#d62976] to-[#4f5bd5]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0c1a36] font-serif text-base font-black text-white">
                        {initials(h.name)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-base font-bold leading-tight break-words">{h.name}</span>
                      <span className="block font-mono text-[11px] text-white/65 truncate">@{h.handle}</span>
                    </span>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white text-[#14264a] group-hover:bg-[#7a1f2b] group-hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors">
                      <span className="hidden min-[420px]:inline">Follow</span> <ArrowUpRight size={12} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 font-sans text-[10px] text-white/55 leading-snug">
        These are independent accounts. The Ceylon Review does not control them, and listing one does not mean we endorse every post.
      </p>
    </section>
  );
}
