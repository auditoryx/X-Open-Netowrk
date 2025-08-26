'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Clock, Award, TrendingUp,
  Heart, MessageCircle, Calendar,
  Grid, List, Zap, Crown
} from 'lucide-react';
import { SmartRecommendation } from '@/lib/services/advancedSearchService';
import Image from 'next/image';
import CreatorCard from '@/components/cards/CreatorCard';

interface SmartSearchResultsProps {
  results: SmartRecommendation[];
  isLoading: boolean;
  query: string;
  onSaveCreator?: (creatorId: string) => void;
  onMessageCreator?: (creatorId: string) => void;
  onBookCreator?: (creatorId: string) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortMode = 'relevance' | 'rating' | 'price' | 'availability' | 'trending';

export const SmartSearchResults: React.FC<SmartSearchResultsProps> = ({
  results,
  isLoading,
  query,
  onSaveCreator,
  onMessageCreator,
  onBookCreator,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [filteredResults, setFilteredResults] = useState<SmartRecommendation[]>(results);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    let sorted = [...results];
    
    switch (sortMode) {
      case 'rating':
        sorted.sort((a, b) => (b.creator.rating || 0) - (a.creator.rating || 0));
        break;
      case 'price':
        sorted.sort((a, b) => (a.creator.pricing?.hourlyRate || 0) - (b.creator.pricing?.hourlyRate || 0));
        break;
      case 'availability':
        sorted.sort((a, b) => {
          const aAvailable = a.creator.availability?.immediate ? 1 : 0;
          const bAvailable = b.creator.availability?.immediate ? 1 : 0;
          return bAvailable - aAvailable;
        });
        break;
      case 'trending':
        sorted.sort((a, b) => b.matchScore - a.matchScore);
        break;
      default: // relevance
        sorted.sort((a, b) => b.confidence - a.confidence);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      sorted = sorted.filter(result => 
        result.tags.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredResults(sorted);
  }, [results, sortMode, selectedTags]);

  // Get all unique tags from results
  const allTags = Array.from(new Set(results.flatMap(result => result.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (confidence >= 80) return <Zap className="w-4 h-4 text-blue-500" />;
    if (confidence >= 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <Award className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <SearchResultsSkeleton />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg mb-4">
          No results found for "{query}"
        </div>
        <div className="text-gray-400">
          Try adjusting your search terms or filters
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Analytics & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Results Summary */}
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {filteredResults.length} Smart Matches Found
              </div>
              <div className="text-sm text-gray-500">
                AI-powered results for "{query}"
              </div>
            </div>
            
            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          </div>

          {/* View & Sort Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Best Match</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="availability">Available Now</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <SearchAnalytics results={filteredResults} query={query} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-3">Filter by tags:</div>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Grid/List */}
      <motion.div
        layout
        className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        <AnimatePresence>
          {filteredResults.map((result, index) => (
            <motion.div
              key={result.creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              {viewMode === 'grid' ? (
                <CreatorCard
                  id={result.creator.id}
                  name={result.creator.displayName}
                  tagline={result.creator.tagline}
                  price={result.creator.pricing?.hourlyRate}
                  location={result.creator.location}
                  imageUrl={result.creator.avatar}
                  rating={result.creator.rating}
                  reviewCount={result.creator.reviewCount}
                  tier={result.creator.tier}
                  xp={result.creator.xp}
                  tierFrozen={result.creator.tierFrozen}
                  signature={result.creator.signature}
                />
              ) : (
                <CreatorListItem
                  recommendation={result}
                  onSave={onSaveCreator}
                  onMessage={onMessageCreator}
                  onBook={onBookCreator}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Creator List Item Component for List View
interface CreatorListItemProps {
  recommendation: SmartRecommendation;
  onSave?: (creatorId: string) => void;
  onMessage?: (creatorId: string) => void;
  onBook?: (creatorId: string) => void;
}

const CreatorListItem: React.FC<CreatorListItemProps> = ({
  recommendation,
  onSave,
  onMessage,
  onBook
}) => {
  const { creator, matchScore, reasons, confidence, tags } = recommendation;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="relative w-20 h-20 flex-shrink-0">
          {creator.avatar ? (
            <Image
              src={creator.avatar}
              alt={creator.displayName}
              width={80}
              height={80}
              className="rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {creator.displayName?.charAt(0)}
            </div>
          )}
          
          {creator.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{creator.displayName}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(matchScore)}`}>
                  {Math.round(matchScore)}% match
                </div>
                {getConfidenceIcon(confidence)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                {creator.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{creator.rating}</span>
                  </div>
                )}
                {creator.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{creator.location}</span>
                  </div>
                )}
                {creator.availability?.immediate && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span>Available Now</span>
                  </div>
                )}
                {creator.pricing && (
                  <span className="font-medium">${creator.pricing.hourlyRate}/hour</span>
                )}
              </div>
            </div>

            <button
              onClick={() => onSave?.(creator.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{creator.bio}</p>

          {/* AI Insights */}
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Match reasons:</div>
            <div className="text-sm text-gray-600">
              {reasons.slice(0, 2).join(' • ')}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 6).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => onMessage?.(creator.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Message
            </button>
            <button
              onClick={() => onBook?.(creator.id)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Analytics Component
interface SearchAnalyticsProps {
  results: SmartRecommendation[];
  query: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ results, query }) => {
  const avgMatchScore = results.reduce((sum, r) => sum + r.matchScore, 0) / results.length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const topTags = results
    .flatMap(r => r.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedTags = Object.entries(topTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-blue-700 font-medium mb-1">Average Match Score</div>
        <div className="text-2xl font-bold text-blue-900">{Math.round(avgMatchScore)}%</div>
        <div className="text-blue-600 text-sm">AI relevance rating</div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <div className="text-green-700 font-medium mb-1">AI Confidence</div>
        <div className="text-2xl font-bold text-green-900">{Math.round(avgConfidence)}%</div>
        <div className="text-green-600 text-sm">Prediction accuracy</div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="text-purple-700 font-medium mb-1">Top Categories</div>
        <div className="space-y-1">
          {sortedTags.slice(0, 3).map(([tag, count]) => (
            <div key={tag} className="flex justify-between text-sm">
              <span className="text-purple-900">{tag}</span>
              <span className="text-purple-600">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartSearchResults;
