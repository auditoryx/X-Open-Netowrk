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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Explore</h1>
        <p className="text-gray-600">This page is temporarily under construction.</p>
      </div>
    </div>
  );
}