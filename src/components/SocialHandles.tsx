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

// Compact "Follow the struggle" strip shown under the front-page articles.
// Each account is a small card that opens its Instagram profile in a new tab.
export default function SocialHandles() {
  const items = SOCIAL_GROUPS.flatMap((g) => g.handles.map((h) => ({ ...h, group: g.title })));

  return (
    <section className="rounded-lg bg-[#14264a] text-white p-4 shadow-md" id="social-handles">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9a03f] via-[#d62976] to-[#4f5bd5]">
          <Instagram size={13} className="text-white" />
        </span>
        <h3 className="font-serif text-lg font-black leading-none">Follow the struggle</h3>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((h) => (
          <li key={h.handle}>
            <a
              href={`https://www.instagram.com/${h.handle}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${h.name} on Instagram (opens in a new tab)`}
              className="group flex items-center gap-2 rounded-md bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 hover:border-white/30 px-2 py-1.5 transition-colors"
            >
              <span className="shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#f9a03f] via-[#d62976] to-[#4f5bd5]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1a36] font-serif text-[11px] font-black text-white">
                  {initials(h.name)}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-[13px] font-bold leading-tight line-clamp-2">{h.name}</span>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-white/55 truncate">{h.group}</span>
              </span>
              <ArrowUpRight size={14} className="shrink-0 text-white/50 group-hover:text-white" />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 font-sans text-[9px] text-white/50 leading-snug">
        Independent accounts. Listing one is not an endorsement of every post.
      </p>
    </section>
  );
}
