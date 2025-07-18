'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';
import { useAuth } from '@/lib/hooks/useAuth';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import { getFeaturedCreators, searchCreators } from '@/lib/firestore/explore/queryCreators';
import { useRankedCreators } from '@/hooks/useRankedCreators';
import type { SearchableCreator } from '@/lib/types/Creator';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trackAction } = useProgressiveOnboarding();
  const { user } = useAuth();

  const [featured, setFeatured] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchableCreator[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(!!searchParams.get('q'));

  const [view, setView] = useState<'grid' | 'map'>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  );
  const [filters, setFilters] = useState({
    role: searchParams.get(SCHEMA_FIELDS.USER.ROLE) || '',
    location: searchParams.get('location') || '',
    service: searchParams.get('service') || '',
    genres: searchParams.get('genres')
      ? searchParams.get('genres')!.split(',').filter(Boolean)
      : [],
    minBpm: searchParams.get('minBpm')
      ? parseInt(searchParams.get('minBpm')!, 10)
      : undefined,
    maxBpm: searchParams.get('maxBpm')
      ? parseInt(searchParams.get('maxBpm')!, 10)
      : undefined,
    tier: searchParams.get(SCHEMA_FIELDS.USER.TIER) || 'pro', // pre-check pro filter
    availableNow: searchParams.get('availableNow') === '1',
    searchNearMe: searchParams.get('searchNearMe') === 'true',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radiusKm: searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : 50,
    sort: (searchParams.get('sort') as 'recommended' | 'rating' | 'distance' | 'popularity') || 'recommended',
  });

  useEffect(() => {
    setFeaturedLoading(true);
    getFeaturedCreators()
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, []);

  // Handle search query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      if (urlQuery) {
        handleSearch(urlQuery);
      } else {
        setIsSearchMode(false);
        setSearchResults([]);
      }
    }
  }, [searchParams]);

  // Search function
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query);
      setIsSearchMode(true);
      setSearchLoading(true);
      
      // Track search action for progressive onboarding
      trackAction('search');
      
      try {
        const results = await searchCreators(query, {
          maxResults: 50,
          includeServices: true,
          filters: {
            role: filters.role || undefined,
            location: filters.location || undefined,
            tier: filters.tier === 'pro' ? undefined : filters.tier, // Don't filter by 'pro' specifically
            genres: filters.genres.length > 0 ? filters.genres : undefined
          }
        });
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        // Optionally show a toast notification here
      } finally {
        setSearchLoading(false);
      }
    } else {
      params.delete('q');
      setIsSearchMode(false);
      setSearchResults([]);
      setSearchLoading(false);
    }
    
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    handleSearch('');
  };

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.role) query.set(SCHEMA_FIELDS.USER.ROLE, filters.role);
    if (filters.location) query.set('location', filters.location);
    if (filters.service) query.set('service', filters.service);
    if (filters.genres.length) query.set('genres', filters.genres.join(','));
    if (filters.minBpm !== undefined) query.set('minBpm', String(filters.minBpm));
    if (filters.maxBpm !== undefined) query.set('maxBpm', String(filters.maxBpm));
    if (filters.tier) query.set(SCHEMA_FIELDS.USER.TIER, filters.tier);
    if (filters.searchNearMe) query.set('searchNearMe', 'true');
    if (filters.availableNow) query.set('availableNow', '1');
    if (filters.lat) query.set('lat', String(filters.lat));
    if (filters.lng) query.set('lng', String(filters.lng));
    if (filters.radiusKm) query.set('radiusKm', String(filters.radiusKm));
    if (filters.sort) query.set('sort', filters.sort);
    query.set('view', view);
    router.replace('/explore?' + query.toString());
  }, [filters, view, router]);

  // Use the new ranked creators hook for grid view
  const { 
    data: rankedCreatorsPages, 
    isLoading: rankedCreatorsLoading,
    error: rankedCreatorsError 
  } = useRankedCreators({ filters, pageSize: 20 });
  const rankedCreators = rankedCreatorsPages?.pages?.flat() || [];

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      role: '',
      location: '',
      service: '',
      genres: [],
      minBpm: undefined,
      maxBpm: undefined,
      tier: '',
      availableNow: false,
      searchNearMe: false,
      lat: undefined,
      lng: undefined,
      radiusKm: 50,
      sort: 'recommended',
    });
  };

  return (
    <div className="min-h-screen bg-ebony text-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            Explore Creators
          </h1>
          <p className="text-gray-400 text-lg">
            Discover {featured.length > 0 ? `${featured.length}+ ` : ''}talented creators ready to work on your next project
          </p>
        </div>

        {/* Enhanced Search Section */}
        <div className="mb-8 space-y-4">
          {/* Main Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search creators, genres, services, tags..."
              className="w-full px-4 py-3 pl-12 bg-panel border border-neutral-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Genre Tags */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-gray-400">Popular genres:</span>
              {['Hip-Hop', 'R&B', 'Electronic', 'Pop', 'Rock', 'Jazz', 'Trap', 'House', 'Reggaeton', 'Country'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    const newGenres = filters.genres.includes(genre.toLowerCase())
                      ? filters.genres.filter(g => g !== genre.toLowerCase())
                      : [...filters.genres, genre.toLowerCase()];
                    setFilters(prev => ({ ...prev, genres: newGenres }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.genres.includes(genre.toLowerCase())
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Service Type Tags */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-gray-400">Services:</span>
              {['Mixing', 'Mastering', 'Production', 'Vocals', 'Songwriting', 'Video', 'Photography', 'Studio'].map((service) => (
                <button
                  key={service}
                  onClick={() => setFilters(prev => ({ ...prev, service: prev.service === service.toLowerCase() ? '' : service.toLowerCase() }))}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.service === service.toLowerCase()
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-sm text-gray-400">Quick filters:</span>
            {['artist', 'producer', 'engineer', 'videographer', 'studio'].map((role) => (
              <button
                key={role}
                onClick={() => setFilters(prev => ({ ...prev, role: prev.role === role ? '' : role }))}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.role === role
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">View:</span>
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  view === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-3 py-1 rounded text-sm ${
                  view === 'map' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Search Results */}
          {isSearchMode && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Search Results for "{searchQuery}"
                </h2>
                <span className="text-sm text-gray-400">
                  {searchLoading ? 'Searching...' : `${searchResults.length} results`}
                </span>
              </div>
              
              {searchLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-panel rounded-xl p-4 animate-pulse">
                      <div className="h-12 w-12 bg-neutral-700 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-700 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-700 rounded mb-4 w-2/3"></div>
                      <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((creator) => (
                    <div key={creator.uid} className="bg-panel rounded-xl p-4 hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                          {creator.displayName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{creator.displayName}</h3>
                          <p className="text-sm text-gray-400">{creator.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{creator.bio}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{creator.location}</span>
                        <span className="text-brand-400">View Profile</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No creators found</h3>
                  <p className="text-gray-400">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          )}

          {/* Featured Creators */}
          {!isSearchMode && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Creators</h2>
              
              {featuredLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-panel rounded-xl p-4 animate-pulse">
                      <div className="h-12 w-12 bg-neutral-700 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-700 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-700 rounded mb-4 w-2/3"></div>
                      <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featured.map((creator) => (
                    <div key={creator.uid} className="bg-panel rounded-xl p-4 hover:bg-neutral-800 transition-colors border border-neutral-700 hover:border-neutral-600">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                          {creator.displayName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{creator.displayName}</h3>
                          <p className="text-sm text-gray-400">{creator.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{creator.bio}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{creator.location}</span>
                        <a 
                          href={`/profile/${creator.uid}`}
                          className="text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          View Profile →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-xl font-semibold mb-2">No creators available</h3>
                  <p className="text-gray-400">Check back later for featured creators</p>
                </div>
              )}
            </div>
          )}

          {/* Browse by Role Section */}
          {!isSearchMode && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Browse by Role</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { icon: '🎤', role: 'artist', count: '2.5K+' },
                  { icon: '🎧', role: 'producer', count: '1.8K+' },
                  { icon: '🎚️', role: 'engineer', count: '1.2K+' },
                  { icon: '🎥', role: 'videographer', count: '800+' },
                  { icon: '🏢', role: 'studio', count: '400+' },
                ].map(({ icon, role, count }) => (
                  <div
                    key={role}
                    onClick={() => setFilters(prev => ({ ...prev, role }))}
                    className="bg-panel rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-800 transition-colors border border-neutral-700 hover:border-brand-500"
                  >
                    <div className="text-3xl mb-2">{icon}</div>
                    <h3 className="font-semibold text-white capitalize">{role}</h3>
                    <p className="text-sm text-gray-400">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}