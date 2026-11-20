import React from 'react';
import { Newspaper, Archive, UserCircle, Film } from 'lucide-react';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'current', label: 'Current News', icon: Newspaper },
    { id: 'past', label: 'Archival Ledger', icon: Archive },
    { id: 'media', label: 'Media & Galleries', icon: Film },
    { id: 'writer', label: "Writers' Profiles", icon: UserCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6" id="editorial-nav-bar">
      <nav className="border-2 border-[#0c1a36] bg-[#14264a] rounded shadow-md" id="tab-nav-wrapper">
        <div className="flex justify-start sm:justify-center gap-2 sm:gap-12 py-3 sm:py-3.5 px-2 overflow-x-auto whitespace-nowrap" id="tabs-inner-list">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold shrink-0 cursor-pointer transition-all duration-200 px-3 sm:px-4 py-2 rounded border-2
                  ${isActive 
                    ? 'bg-[#7a1f2b] text-white border-white shadow-inner' 
                    : 'text-white/85 hover:text-white hover:bg-white/10 border-transparent'
                  }
                `}
                id={`tab-btn-${tab.id}`}
              >
                <IconComponent 
                  size={14} 
                  className={`
                    stroke-[2] transition-colors
                    text-white
                  `} 
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
