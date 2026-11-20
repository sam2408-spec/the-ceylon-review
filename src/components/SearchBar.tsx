import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Category, Article, Writer, CATEGORIES } from '../types';
import WriterArticleMenu from './WriterArticleMenu';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  resultsCount: number;
  totalCount: number;
  writers: Writer[];
  articles: Article[];
  onReadArticle: (article: Article) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  resultsCount,
  totalCount,
  writers,
  articles,
  onReadArticle
}: SearchBarProps) {
  const categories: (Category | 'All')[] = ['All', ...CATEGORIES];

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6" id="editorial-search-container">
      <div className="bg-white border-2 border-[#7a1f2b]/40 p-5 shadow-lg flex flex-col gap-4 rounded">
        
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#7a1f2b]">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news titles, legal analyses, or authors..."
              className="w-full bg-white border-2 border-[#7a1f2b]/40 pl-10 pr-12 py-2.5 text-sm font-sans text-stone-900 placeholder-gray-500 rounded font-semibold focus:outline-none focus:border-[#9b2c3b] transition-colors"
              id="search-input-field"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-mono font-bold text-[#7a1f2b] hover:text-[#6a1a26] hover:underline cursor-pointer"
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
                className="flex items-center gap-1 bg-[#f8eff1] hover:bg-[#f8eff1] text-stone-900 text-xs font-mono font-extrabold uppercase border border-[#7a1f2b]/50 px-3 py-2.5 transition-all cursor-pointer rounded"
                title="Reset Filters"
                id="reset-filter-btn"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            <WriterArticleMenu writers={writers} articles={articles} onReadArticle={onReadArticle} />

            <div className="flex items-center gap-1.5 px-3 border border-[#7a1f2b]/30 bg-[#f8eff1] text-stone-700 font-mono text-xs font-bold rounded">
              <Filter size={13} className="text-[#9b2c3b]" />
              <span>Catalog Index</span>
            </div>
          </div>
        </div>

        {/* Categories Pills Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#7a1f2b]/20 pt-3" id="categories-wrapper">
          <span className="font-mono text-[10px] text-[#6a1a26] font-black uppercase mr-1">Columns:</span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-xs font-serif font-black border cursor-pointer transition-all rounded-full select-none
                  ${isActive 
                    ? 'bg-[#7a1f2b] text-white border-[#9b2c3b] font-bold shadow-md ring-1 ring-[#c06a78]/30' 
                    : 'bg-stone-100 border-[#7a1f2b]/30 text-stone-700 hover:border-[#9b2c3b] hover:text-stone-900 hover:bg-[#f8eff1]'
                  }
                `}
                id={`cat-filter-btn-${cat}`}
              >
                {cat}
              </button>
            );
          })}

          <div className="ml-auto text-[10px] font-mono text-stone-500 font-bold uppercase block sm:inline">
            Matches: <strong className="text-[#7a1f2b] font-black">{resultsCount}</strong> / {totalCount} dispatches
          </div>
        </div>
      </div>
    </div>
  );
}
