'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Trending, Star, MapPin, Music, User, Clock, Bookmark } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { AdvancedSearchService, SearchSuggestion, SmartRecommendation } from '@/lib/services/advancedSearchService';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedSearchInterfaceProps {
  onSearch: (results: SmartRecommendation[]) => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedSearchInterface: React.FC<AdvancedSearchInterfaceProps> = ({
  onSearch,
  placeholder = "Search creators, services, genres...",
  className = ""
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchService = useRef(new AdvancedSearchService());
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load saved and recent searches on mount
  useEffect(() => {
    if (user) {
      loadUserSearchHistory();
    }
  }, [user]);

  // Handle search suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserSearchHistory = async () => {
    try {
      if (user) {
        const saved = await searchService.current.getSavedSearches(user.uid);
        const recent = await searchService.current.getRecentSearches(user.uid);
        setSavedSearches(saved);
        setRecentSearches(recent);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const suggestionsData = await searchService.current.getSearchSuggestions(
        searchQuery,
        user?.uid
      );
      setSuggestions(suggestionsData);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setShowSuggestions(false);
      
      // Perform intelligent search
      const results = await searchService.current.intelligentSearch(
        searchQuery,
        user?.uid,
        filters
      );
      
      // Update recent searches
      if (user) {
        await searchService.current.addToRecentSearches(user.uid, searchQuery);
        setRecentSearches(prev => [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10));
      }
      
      onSearch(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const handleSaveSearch = async () => {
    if (!user || !query.trim()) return;
    
    try {
      await searchService.current.saveSearch(user.uid, query);
      setSavedSearches(prev => [query, ...prev.filter(s => s !== query)]);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'creator': return <User className="w-4 h-4" />;
      case 'service': return <Music className="w-4 h-4" />;
      case 'genre': return <Star className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'trending': return <Trending className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionBadgeColor = (type: string) => {
    switch (type) {
      case 'creator': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'genre': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-orange-100 text-orange-800';
      case 'trending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-none outline-none rounded-l-xl"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pr-4">
            {query && user && (
              <button
                onClick={handleSaveSearch}
                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                title="Save search"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600'
              }`}
              title="Advanced filters"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-medium">{suggestion.text}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSuggestionBadgeColor(suggestion.type)}`}>
                            {suggestion.type}
                          </span>
                        </div>
                        {suggestion.metadata && (
                          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                            {suggestion.metadata.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{suggestion.metadata.rating}</span>
                              </div>
                            )}
                            {suggestion.metadata.category && (
                              <span>{suggestion.metadata.category}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-gray-400">{suggestion.count} results</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent and Saved Searches */}
        {!showSuggestions && !query && (recentSearches.length > 0 || savedSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-500">Recent Searches</h3>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          handleSearch(search);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {savedSearches.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Bookmark className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-500">Saved Searches</h3>
                  </div>
                  <div className="space-y-1">
                    {savedSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          handleSearch(search);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <AdvancedFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApply={() => handleSearch()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Advanced Filters Panel Component
interface AdvancedFiltersPanelProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onApply
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const genres = [
    'Hip Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 
    'Country', 'Reggae', 'Folk', 'Alternative', 'Funk'
  ];

  const services = [
    'Music Production', 'Mixing', 'Mastering', 'Vocal Recording', 
    'Beat Making', 'Songwriting', 'Audio Engineering', 'Podcast Production'
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <select
            value={localFilters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Service Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <select
            value={localFilters.serviceType || ''}
            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={localFilters.minBudget || ''}
              onChange={(e) => handleFilterChange('minBudget', parseInt(e.target.value) || 0)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max $"
              value={localFilters.maxBudget || ''}
              onChange={(e) => handleFilterChange('maxBudget', parseInt(e.target.value) || 0)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
          <select
            value={localFilters.minRating || ''}
            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <select
            value={localFilters.availability || ''}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Time</option>
            <option value="immediate">Available Now</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="City, State or Remote"
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            setLocalFilters({});
            onFiltersChange({});
          }}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Clear All Filters
        </button>
        <button
          onClick={onApply}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearchInterface;
