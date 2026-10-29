import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Category } from '../types';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  resultsCount: number;
  totalCount: number;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  resultsCount,
  totalCount
}: SearchBarProps) {
  const categories: (Category | 'All')[] = ['All', 'Politics', 'Tech', 'Science', 'Opinion', 'Culture', 'Business'];

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6" id="editorial-search-container">
      <div className="bg-paper-card border-2 border-[#580a0a]/20 p-5 shadow-sm flex flex-col gap-4 rounded">
        
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#5e5347]">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news titles, legal analyses, or authors..."
              className="w-full bg-[#fdfbf6] border-2 border-[#580a0a]/20 pl-10 pr-12 py-2.5 text-sm font-sans text-[#141110] placeholder-[#5e5347]/50 rounded font-semibold focus:outline-none focus:border-[#580a0a]"
              id="search-input-field"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-mono font-bold text-[#5e5347] hover:text-[#580a0a] hover:underline cursor-pointer"
                id="clear-search-btn"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Reset Button */}
            {(searchTerm || selectedCategory !== 'All') && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-1 bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/80 text-[#141110] text-xs font-mono font-extrabold uppercase border border-[#580a0a]/20 px-3 py-2.5 transition-all cursor-pointer rounded"
                title="Reset Filters"
                id="reset-filter-btn"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 border border-[#580a0a]/20 bg-[#ebdcb9]/20 text-[#5e5347] font-mono text-xs font-bold rounded">
              <Filter size={13} className="text-[#580a0a]" />
              <span>Catalog Index</span>
            </div>
          </div>
        </div>

        {/* Categories Pills Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#580a0a]/10 pt-3" id="categories-wrapper">
          <span className="font-mono text-[10px] text-[#5e5347] font-black uppercase mr-1">Columns:</span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-xs font-serif font-black border cursor-pointer transition-all rounded-full select-none
                  ${isActive 
                    ? 'bg-[#580a0a] text-white border-[#580a0a] font-bold shadow-sm' 
                    : 'bg-[#ebdcb9]/30 border-[#580a0a]/25 text-[#5e5347] hover:border-[#580a0a]/50 hover:text-[#141110]'
                  }
                `}
                id={`cat-filter-btn-${cat}`}
              >
                {cat}
              </button>
            );
          })}

          <div className="ml-auto text-[10px] font-mono text-[#5e5347] font-bold uppercase block sm:inline">
            Matches: <strong className="text-[#141110] font-black">{resultsCount}</strong> / {totalCount} dispatches
          </div>
        </div>
      </div>
    </div>
  );
}
