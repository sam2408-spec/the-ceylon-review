import React from 'react';
import { REGIONS } from '../data/regions';

interface RegionTabsProps {
  activeRegion: string | null;
  onSelect: (id: string) => void;
}

// Second navigation row: one tab per region, with World as the last tab.
export default function RegionTabs({ activeRegion, onSelect }: RegionTabsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-3" id="region-nav-bar">
      <nav aria-label="Regions" className="border border-[#7a1f2b]/30 bg-white rounded">
        <div className="flex gap-1 sm:gap-2 py-2 px-2 overflow-x-auto whitespace-nowrap sm:justify-center">
          {REGIONS.map((r) => {
            const active = activeRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 cursor-pointer text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold px-3 py-1.5 rounded border transition-colors ${
                  active
                    ? 'bg-[#7a1f2b] text-white border-[#7a1f2b]'
                    : 'text-[#14264a] border-transparent hover:bg-[#7a1f2b]/10'
                }`}
                id={`region-btn-${r.id}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
