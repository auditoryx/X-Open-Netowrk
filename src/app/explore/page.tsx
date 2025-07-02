'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DiscoveryMap = dynamic(() => import('@/components/explore/DiscoveryMap'), {
  ssr: false,
});
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import CreatorCard from '@/components/cards/CreatorCard';
import SearchBar from '@/components/explore/SearchBar';
import { getFeaturedCreators } from '@/lib/firestore/getFeaturedCreators';
import { searchCreators } from '@/lib/firestore/searchCreators';
import { useRankedCreators } from '@/hooks/useRankedCreators';
import FilterPanel from '@/components/explore/FilterPanel';
import { SearchableCreator } from '@/lib/utils/filterByKeyword';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [featured, setFeatured] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchableCreator[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(!!searchParams.get('q'));

  const [view, setView] = useState<'grid' | 'map'>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  );
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
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
    tier: searchParams.get('tier') || 'pro', // pre-check pro filter
    availableNow: searchParams.get('availableNow') === '1',
    searchNearMe: searchParams.get('searchNearMe') === 'true',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radiusKm: searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : 50,
    sort: (searchParams.get('sort') as 'recommended' | 'rating' | 'distance' | 'popularity') || 'recommended',
  });

  useEffect(() => {
    getFeaturedCreators().then(setFeatured).catch(() => setFeatured([]));
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
    if (filters.role) query.set('role', filters.role);
    if (filters.location) query.set('location', filters.location);
    if (filters.service) query.set('service', filters.service);
    if (filters.genres.length) query.set('genres', filters.genres.join(','));
    if (filters.minBpm !== undefined) query.set('minBpm', String(filters.minBpm));
    if (filters.maxBpm !== undefined) query.set('maxBpm', String(filters.maxBpm));
    if (filters.tier) query.set('tier', filters.tier);
    if (filters.searchNearMe) {
      query.set('searchNearMe', 'true');
    }
    if (filters.availableNow) query.set('availableNow', '1');
    if (filters.lat) query.set('lat', String(filters.lat));
    if (filters.lng) query.set('lng', String(filters.lng));
    if (filters.radiusKm) query.set('radiusKm', String(filters.radiusKm));
    if (filters.sort) query.set('sort', filters.sort);
    query.set('view', view);
    router.replace('/explore?' + query.toString());
  }, [filters, view, router]);

  // Use the new ranked creators hook for grid view
  const { data: rankedCreatorsPages } = useRankedCreators({ filters, pageSize: 20 });
  const rankedCreators = rankedCreatorsPages?.pages?.flat() || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="text-right text-xs mb-2">
        <Link href="/leaderboards/tokyo/producer" className="underline">
          View Tokyo leaderboard
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Explore Creators</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded border text-sm ${view === 'grid' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded border text-sm ${view === 'map' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search creators by name, tags, bio, or services..."
          initialValue={searchQuery}
          showSuggestions={true}
        />
      </div>

      <FilterPanel filters={filters} setFilters={setFilters} />

      {/* Search Results */}
      {isSearchMode ? (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {searchLoading ? 'Searching...' : `Search Results for "${searchQuery}"`}
            </h2>
            <div className="flex items-center gap-4">
              {!searchLoading && (
                <span className="text-sm text-gray-400">
                  {searchResults.length} creator{searchResults.length !== 1 ? 's' : ''} found
                </span>
              )}
              <button
                onClick={clearSearch}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
          
          {searchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-32 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map(creator => (
                <CreatorCard
                  key={creator.uid}
                  id={creator.uid}
                  name={creator.displayName || creator.name || 'Unnamed'}
                  tagline={creator.bio}
                  price={creator.price}
                  location={creator.location}
                  imageUrl={creator.photoURL}
                  rating={creator.averageRating}
                  reviewCount={creator.reviewCount}
                  tier={creator.tier}
                  xp={creator.xp}
                  rankScore={creator.rankScore}
                  tierFrozen={creator.tierFrozen}
                  signature={creator.signature}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No creators found</div>
              <div className="text-gray-500 text-sm">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured Creators (only show when not searching) */}
          {featured.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">🔥 Featured Creators</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4">
                {featured.map(c => (
                  <div key={c.uid} className="min-w-[220px]">
                    <CreatorCard
                      id={c.uid}
                      name={c.displayName || c.name || 'Unnamed'}
                      tagline={c.bio}
                      price={c.price}
                      location={c.location}
                      imageUrl={c.photoURL}
                      rating={c.averageRating}
                      reviewCount={c.reviewCount}
                      tier={c.tier}
                      xp={c.xp}
                      rankScore={c.rankScore}
                      tierFrozen={c.tierFrozen}
                      signature={c.signature}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Main Content Grid/Map */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rankedCreators.map(c => (
                <CreatorCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  tagline={c.tagline}
                  price={c.price}
                  location={c.location}
                  imageUrl={c.imageUrl}
                  rating={c.rating}
                  reviewCount={c.reviewCount}
                  tier={c.tier}
                  xp={c.xp}
                  rankScore={c.rankScore}
                  tierFrozen={c.tierFrozen}
                  signature={c.signature}
                />
              ))}
            </div>
          ) : (
            <div className="h-[80vh] rounded overflow-hidden border border-white">
              <Suspense fallback={<div className="p-4">Loading map...</div>}>
                <DiscoveryMap filters={filters} />
              </Suspense>
            </div>
          )}
        </>
      )}
      <FloatingCartButton />
    </div>
  );
}
