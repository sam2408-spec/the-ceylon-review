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
      <nav className="border border-[#580a0a] bg-[#141110] rounded-sm" id="tab-nav-wrapper">
        <div className="flex justify-center gap-4 sm:gap-12 py-3 px-2 overflow-x-auto whitespace-nowrap" id="tabs-inner-list">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold cursor-pointer transition-all duration-200 pb-1 border-b-2
                  ${isActive 
                    ? 'text-white border-[#580a0a]' 
                    : 'text-white/55 hover:text-white border-transparent'
                  }
                `}
                id={`tab-btn-${tab.id}`}
              >
                <IconComponent 
                  size={13} 
                  className={`
                    stroke-[2] transition-colors
                    ${isActive ? 'text-[#ebdcb9]' : 'text-white/45'}
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
