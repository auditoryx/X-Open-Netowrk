'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  category: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (filterId: string) => void;
  onClear: () => void;
  className?: string;
}

export default function FilterChips({ 
  filters, 
  onRemove, 
  onClear, 
  className = '' 
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <motion.div 
      className={`flex flex-wrap items-center gap-2 p-4 bg-gray-900 border-2 border-gray-700 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-brutalist-mono text-xs uppercase tracking-wider text-gray-400 mr-2">
        Filters:
      </span>
      
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <AnimatePresence mode="popLayout">
          {filters.map((filter) => (
            <motion.div
              key={filter.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black text-sm font-brutalist-mono rounded-none border-2 border-gray-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              layout
            >
              <span className="font-medium">{filter.label}</span>
              <button
                onClick={() => onRemove(filter.id)}
                className="hover:text-red-600 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filters.length > 1 && (
        <motion.button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-white transition-colors font-brutalist-mono underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear All
        </motion.button>
      )}
    </motion.div>
  );
}

// Sticky filter bar component
interface StickyFilterBarProps {
  isSticky: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StickyFilterBar({ 
  isSticky, 
  children, 
  className = '' 
}: StickyFilterBarProps) {
  return (
    <motion.div
      className={`transition-all duration-300 ${isSticky 
        ? 'fixed top-0 left-0 right-0 z-40 shadow-lg' 
        : 'relative'
      } ${className}`}
      animate={{
        y: isSticky ? 0 : 0,
        boxShadow: isSticky ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="bg-brutalist-black border-b-2 border-white">
        {children}
      </div>
    </motion.div>
  );
}

// Helper hook for managing filter state
export function useFilterChips() {
  const [activeFilters, setActiveFilters] = React.useState<FilterChip[]>([]);

  const addFilter = (filter: FilterChip) => {
    setActiveFilters(prev => {
      // Remove existing filter of same category if it exists
      const filtered = prev.filter(f => f.category !== filter.category || f.id !== filter.id);
      return [...filtered, filter];
    });
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const updateFiltersFromParams = (searchParams: URLSearchParams) => {
    const filters: FilterChip[] = [];
    
    // Add role filter
    const role = searchParams.get(SCHEMA_FIELDS.USER.ROLE);
    if (role) {
      filters.push({
        id: SCHEMA_FIELDS.USER.ROLE,
        label: `Role: ${role.toUpperCase()}`,
        value: role,
        category: SCHEMA_FIELDS.USER.ROLE
      });
    }
    
    // Add location filter
    const location = searchParams.get('location');
    if (location) {
      filters.push({
        id: 'location',
        label: `Location: ${location}`,
        value: location,
        category: 'location'
      });
    }
    
    // Add genre filters
    const genres = searchParams.get('genres');
    if (genres) {
      const genreList = genres.split(',').filter(Boolean);
      genreList.forEach((genre, index) => {
        filters.push({
          id: `genre-${index}`,
          label: `Genre: ${genre}`,
          value: genre,
          category: 'genre'
        });
      });
    }
    
    // Add tier filter
    const tier = searchParams.get(SCHEMA_FIELDS.USER.TIER);
    if (tier && tier !== 'all') {
      filters.push({
        id: SCHEMA_FIELDS.USER.TIER,
        label: `Tier: ${tier.toUpperCase()}`,
        value: tier,
        category: SCHEMA_FIELDS.USER.TIER
      });
    }
    
    // Add availability filter
    const availableNow = searchParams.get('availableNow');
    if (availableNow === '1') {
      filters.push({
        id: 'available',
        label: 'Available Now',
        value: 'true',
        category: 'availability'
      });
    }

    setActiveFilters(filters);
  };

  return {
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
    updateFiltersFromParams
  };
}