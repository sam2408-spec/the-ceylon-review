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
      <div className="bg-[#151313] border-2 border-[#991b1b]/40 p-5 shadow-lg flex flex-col gap-4 rounded">
        
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-red-400">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news titles, legal analyses, or authors..."
              className="w-full bg-[#0e0c0c] border-2 border-[#991b1b]/40 pl-10 pr-12 py-2.5 text-sm font-sans text-[#f5eedc] placeholder-gray-500 rounded font-semibold focus:outline-none focus:border-[#dc2626] transition-colors"
              id="search-input-field"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-mono font-bold text-red-400 hover:text-red-200 hover:underline cursor-pointer"
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
                className="flex items-center gap-1 bg-[#2b1616] hover:bg-[#3d1c1c] text-[#f5eedc] text-xs font-mono font-extrabold uppercase border border-[#991b1b]/50 px-3 py-2.5 transition-all cursor-pointer rounded"
                title="Reset Filters"
                id="reset-filter-btn"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 border border-[#991b1b]/30 bg-[#1f1515] text-[#d4c8b8] font-mono text-xs font-bold rounded">
              <Filter size={13} className="text-[#dc2626]" />
              <span>Catalog Index</span>
            </div>
          </div>
        </div>

        {/* Categories Pills Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#991b1b]/20 pt-3" id="categories-wrapper">
          <span className="font-mono text-[10px] text-red-300 font-black uppercase mr-1">Columns:</span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-xs font-serif font-black border cursor-pointer transition-all rounded-full select-none
                  ${isActive 
                    ? 'bg-[#991b1b] text-white border-[#dc2626] font-bold shadow-md ring-1 ring-red-400/30' 
                    : 'bg-[#1a1414] border-[#991b1b]/30 text-[#d4c8b8] hover:border-[#dc2626] hover:text-white hover:bg-[#251717]'
                  }
                `}
                id={`cat-filter-btn-${cat}`}
              >
                {cat}
              </button>
            );
          })}

          <div className="ml-auto text-[10px] font-mono text-gray-400 font-bold uppercase block sm:inline">
            Matches: <strong className="text-red-400 font-black">{resultsCount}</strong> / {totalCount} dispatches
          </div>
        </div>
      </div>
    </div>
  );
}
