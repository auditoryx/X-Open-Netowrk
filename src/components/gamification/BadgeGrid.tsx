/**
 * BadgeGrid Component
 * Displays a grid of badges with filtering and sorting options
 */

import React, { useState, useMemo } from 'react';
import BadgeCard from './BadgeCard';
import { BadgeProgress } from '@/lib/services/badgeService';

interface BadgeGridProps {
  badges: BadgeProgress[];
  loading?: boolean;
  error?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxCols?: number;
  className?: string;
}

type FilterType = 'all' | 'earned' | 'in-progress' | 'locked';
type SortType = 'name' | 'rarity' | 'progress' | 'earned-date';

export default function BadgeGrid({
  badges,
  loading = false,
  error = '',
  showFilters = true,
  showSearch = false,
  size = 'medium',
  maxCols = 6,
  className = ''
}: BadgeGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('rarity');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort badges
  const filteredAndSortedBadges = useMemo(() => {
    let filtered = badges;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'earned':
        filtered = filtered.filter(badge => badge.isEarned);
        break;
      case 'in-progress':
        filtered = filtered.filter(badge => !badge.isEarned && badge.progress.percentage > 0);
        break;
      case 'locked':
        filtered = filtered.filter(badge => !badge.isEarned && badge.progress.percentage === 0);
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
        case 'progress':
          if (a.isEarned && !b.isEarned) return -1;
          if (!a.isEarned && b.isEarned) return 1;
          return b.progress.percentage - a.progress.percentage;
        case 'earned-date':
          if (a.isEarned && b.isEarned && a.awardedAt && b.awardedAt) {
            return b.awardedAt.toMillis() - a.awardedAt.toMillis();
          }
          if (a.isEarned && !b.isEarned) return -1;
          if (!a.isEarned && b.isEarned) return 1;
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [badges, filter, sort, searchTerm]);

  const earnedCount = badges.filter(badge => badge.isEarned).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const gridCols = Math.min(maxCols, 6);
  const gridColClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }[gridCols] || 'grid-cols-4';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Badges</h2>
          <p className="text-sm text-gray-600">
            {earnedCount} of {totalCount} badges earned ({Math.round((earnedCount / totalCount) * 100)}%)
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center space-x-3">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((earnedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="flex flex-wrap items-center gap-4 py-3 border-b border-gray-200">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Filter Buttons */}
          {showFilters && (
            <div className="flex space-x-2">
              {(['all', 'earned', 'in-progress', 'locked'] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${filter === filterType
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                    }
                  `}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')}
                  {filterType !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({filterType === 'earned' ? earnedCount : 
                        filterType === 'in-progress' ? badges.filter(b => !b.isEarned && b.progress.percentage > 0).length :
                        badges.filter(b => !b.isEarned && b.progress.percentage === 0).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Sort Dropdown */}
          {showFilters && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="rarity">Sort by Rarity</option>
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="earned-date">Sort by Earned Date</option>
            </select>
          )}
        </div>
      )}

      {/* Badge Grid */}
      {filteredAndSortedBadges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No badges found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria.' : 
             filter === 'earned' ? 'You haven\'t earned any badges yet. Keep working!' :
             filter === 'in-progress' ? 'No badges in progress. Complete more actions to start earning!' :
             'No badges match your current filter.'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${gridColClass} sm:grid-cols-2 md:grid-cols-3 lg:${gridColClass}`}>
          {filteredAndSortedBadges.map((badge) => (
            <BadgeCard
              key={badge.badgeId}
              badgeId={badge.badgeId}
              name={badge.name}
              description={badge.description}
              iconUrl={badge.iconUrl}
              category={badge.category as any}
              rarity={badge.rarity as any}
              progress={badge.progress}
              isEarned={badge.isEarned}
              awardedAt={badge.awardedAt}
              size={size}
              showProgress={true}
            />
          ))}
        </div>
      )}

      {/* Load More / Pagination could go here in the future */}
    </div>
  );
}
