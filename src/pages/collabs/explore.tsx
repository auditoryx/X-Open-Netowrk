import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  getCollabPackages, 
  getCollabPackagesWithFilters, 
  getFeaturedCollabPackages 
} from '@/src/lib/firestore/getCollabPackages';
import { CollabPackageCard } from '@/src/components/collab/CollabPackageCard';
import { 
  CollabPackage, 
  CollabPackageFilters, 
  formatPackagePrice 
} from '@/src/lib/types/CollabPackage';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function ExploreCollabPackagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [packages, setPackages] = useState<CollabPackage[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<CollabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CollabPackageFilters>({});
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating' | 'popular'>('newest');

  useEffect(() => {
    loadPackages();
    loadFeaturedPackages();
  }, [filters, sortBy]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      let packagesData: CollabPackage[];
      
      if (Object.keys(filters).length > 0) {
        packagesData = await getCollabPackagesWithFilters(filters, 50);
      } else {
        packagesData = await getCollabPackages(50);
      }
      
      // Apply search filter
      if (searchTerm.trim()) {
        packagesData = packagesData.filter(pkg => 
          pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply sorting
      packagesData = sortPackages(packagesData);
      
      setPackages(packagesData);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedPackages = async () => {
    try {
      const featuredData = await getFeaturedCollabPackages(6);
      setFeaturedPackages(featuredData);
    } catch (error) {
      console.error('Error loading featured packages:', error);
    }
  };

  const sortPackages = (packages: CollabPackage[]): CollabPackage[] => {
    const sorted = [...packages];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
      case 'price_low':
        return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
      case 'price_high':
        return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));
      default:
        return sorted;
    }
  };

  const handleFilterChange = (newFilters: Partial<CollabPackageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearch = () => {
    loadPackages();
  };

  if (loading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Explore Collab Packages
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Discover and book collaborative packages with verified creators
              </p>
            </div>
            
            {user && (
              <Link
                href="/collabs/create"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Package
              </Link>
            )}
          </div>
        </div>

        {/* Featured Packages */}
        {featuredPackages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <StarIcon className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Featured Packages
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((package_) => (
                <CollabPackageCard
                  key={package_.id}
                  package={package_}
                  onClick={() => router.push(`/collabs/${package_.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search packages, tags, or descriptions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Search
              </button>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Roles Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roles
                  </label>
                  <div className="space-y-2">
                    {['artist', 'producer', 'engineer', 'videographer', 'studio'].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.roles?.includes(role as any) || false}
                          onChange={(e) => {
                            const currentRoles = filters.roles || [];
                            const newRoles = e.target.checked
                              ? [...currentRoles, role as any]
                              : currentRoles.filter(r => r !== role);
                            handleFilterChange({ roles: newRoles });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min price"
                      value={filters.priceRange?.min || ''}
                      onChange={(e) => handleFilterChange({
                        priceRange: {
                          ...filters.priceRange,
                          min: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max price"
                      value={filters.priceRange?.max || ''}
                      onChange={(e) => handleFilterChange({
                        priceRange: {
                          ...filters.priceRange,
                          max: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Package Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Package Type
                  </label>
                  <select
                    value={filters.packageType || ''}
                    onChange={(e) => handleFilterChange({
                      packageType: e.target.value as CollabPackage['packageType'] || undefined
                    })}
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="studio_session">Studio Session</option>
                    <option value="live_performance">Live Performance</option>
                    <option value="video_production">Video Production</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {packages.length} package{packages.length !== 1 ? 's' : ''} found
          </p>
          
          {Object.keys(filters).length > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Filters applied</span>
              <button
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((package_) => (
              <CollabPackageCard
                key={package_.id}
                package={package_}
                onClick={() => router.push(`/collabs/${package_.id}`)}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No packages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Load More (if needed) */}
        {packages.length > 0 && packages.length % 50 === 0 && (
          <div className="text-center mt-12">
            <button
              onClick={loadPackages}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              Load More Packages
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
