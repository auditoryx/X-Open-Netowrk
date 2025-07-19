'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
}

export default function SearchBar({ 
  onSearch,
  placeholder = "Search creators, genres, services...",
  className = "",
  showSuggestions = true,
  autoFocus = false,
  initialValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Sync with external initialValue prop
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query);
      
      // Save to recent searches if not empty and has minimum length
      if (query.trim() && query.trim().length >= 2) {
        const updated = [
          query.trim(),
          ...recentSearches.filter(s => s !== query.trim())
        ].slice(0, 5);
        setRecentSearches(updated);
        try {
          localStorage.setItem('explore-recent-searches', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save recent search:', error);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, recentSearches]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    onSearch(search);
    setShowDropdown(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('explore-recent-searches');
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {showDropdown && showSuggestions && recentSearches.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Recent Searches</span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearch(search)}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Clock className="h-3 w-3 text-gray-500" />
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {showDropdown && showSuggestions && !query && recentSearches.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-400">
            <div className="font-medium mb-2">Search Tips:</div>
            <ul className="space-y-1 text-xs">
              <li>• Search by creator name, tags, or bio</li>
              <li>• Try service types like "mixing", "mastering"</li>
              <li>• Use genre names like "hip-hop", "electronic"</li>
              <li>• Search locations like "Tokyo", "New York"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}