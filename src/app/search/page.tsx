'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Compass, Zap, TrendingUp, Users, Star, AlertCircle } from 'lucide-react';
import AdvancedSearchInterface from '@/components/search/AdvancedSearchInterface';
import SmartSearchResults from '@/components/search/SmartSearchResults';
import { SmartRecommendation } from '@/lib/services/advancedSearchService';
import { useAuth } from '@/lib/hooks/useAuth';
import { monitoringService } from '@/lib/services/monitoringService';
import { cachingService } from '@/lib/services/cachingService';

// Firebase availability check
let isFirebaseAvailable = false;
try {
  // Check if Firebase config exists
  if (typeof window !== 'undefined') {
    isFirebaseAvailable = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
  }
} catch (error) {
  console.warn('Firebase configuration check failed:', error);
  isFirebaseAvailable = false;
}

interface TrendingSearch {
  query: string;
  count: number;
  category: string;
  growth: number;
}

interface PopularCategory {
  name: string;
  icon: string;
  count: number;
  description: string;
}

// Mock data for when Firebase is unavailable
const mockTrendingSearches: TrendingSearch[] = [
  { query: 'Hip Hop Producer', count: 1250, category: 'Music Production', growth: 15 },
  { query: 'R&B Vocalist', count: 890, category: 'Vocals', growth: 23 },
  { query: 'Trap Beats', count: 2100, category: 'Beats', growth: 31 },
  { query: 'Mixing Engineer', count: 750, category: 'Engineering', growth: 18 },
  { query: 'Singer Songwriter', count: 1100, category: 'Songwriting', growth: 12 },
  { query: 'EDM Producer', count: 950, category: 'Electronic', growth: 27 },
  { query: 'Jazz Guitarist', count: 430, category: 'Live Music', growth: 8 },
  { query: 'Podcast Editor', count: 680, category: 'Audio Editing', growth: 41 },
];

const mockPopularCategories: PopularCategory[] = [
  { name: 'Music Production', icon: '🎵', count: 2500, description: 'Full track production and beat making' },
  { name: 'Vocal Services', icon: '🎤', count: 1800, description: 'Lead vocals, harmonies, and vocal features' },
  { name: 'Audio Engineering', icon: '🎛️', count: 950, description: 'Mixing, mastering, and sound design' },
  { name: 'Live Music', icon: '🎸', count: 1200, description: 'Session musicians and live performers' },
  { name: 'Songwriting', icon: '✍️', count: 800, description: 'Lyrics, melodies, and song composition' },
  { name: 'Video Production', icon: '🎬', count: 650, description: 'Music videos and visual content' },
];

const AdvancedSearchPage = () => {
  // Defensive auth hook usage
  let user = null;
  let authError = null;
  
  try {
    if (isFirebaseAvailable) {
      const authResult = useAuth();
      user = authResult.user;
    }
  } catch (error) {
    console.warn('Auth hook failed, continuing without authentication:', error);
    authError = error;
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setCurrentQuery(query);
      setShowWelcome(false);
      handleSearch([]);
    } else {
      loadTrendingData();
    }
  }, [searchParams]);

  // Track page view with defensive monitoring
  useEffect(() => {
    try {
      if (isFirebaseAvailable) {
        monitoringService.trackBusinessEvent('search_page_viewed', {
          hasQuery: !!searchParams.get('q'),
          userId: user?.uid
        });
      }
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }, [user]);

  const loadTrendingData = async () => {
    try {
      // If Firebase unavailable, use mock data
      if (!isFirebaseAvailable) {
        console.warn('Firebase unavailable, using mock trending data');
        setTrendingSearches(mockTrendingSearches);
        setPopularCategories(mockPopularCategories);
        return;
      }

      const startTime = performance.now();
      
      // Try to get from cache first
      const cachedTrending = await cachingService.get<TrendingSearch[]>('trending_searches');
      const cachedCategories = await cachingService.get<PopularCategory[]>('popular_categories');
      
      if (cachedTrending && cachedCategories) {
        setTrendingSearches(cachedTrending);
        setPopularCategories(cachedCategories);
        monitoringService.trackPerformanceBenchmark('trending_data_cache_hit', startTime);
        return;
      }

      // Fetch from API
      const [trendingResponse, categoriesResponse] = await Promise.all([
        fetch('/api/search/trending'),
        fetch('/api/search/categories')
      ]);

      if (trendingResponse.ok && categoriesResponse.ok) {
        const trending = await trendingResponse.json();
        const categories = await categoriesResponse.json();
        
        setTrendingSearches(trending);
        setPopularCategories(categories);
        
        // Cache the results
        await cachingService.set('trending_searches', trending, { 
          ttl: 300, 
          tags: ['search', 'trending'] 
        });
        await cachingService.set('popular_categories', categories, { 
          ttl: 600, 
          tags: ['search', 'categories'] 
        });
        
        monitoringService.trackPerformanceBenchmark('trending_data_api_fetch', startTime);
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock trending data');
        setTrendingSearches(mockTrendingSearches);
        setPopularCategories(mockPopularCategories);
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
      
      // Use mock data as fallback
      setTrendingSearches(mockTrendingSearches);
      setPopularCategories(mockPopularCategories);
      
      // Safe error reporting
      try {
        if (isFirebaseAvailable) {
          monitoringService.reportError({
            message: 'Failed to load trending data',
            stack: error instanceof Error ? error.stack : undefined,
            url: window.location.href,
            userId: user?.uid,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            sessionId: monitoringService.getSessionMetrics().sessionId
          });
        }
      } catch (reportError) {
        console.warn('Failed to report error:', reportError);
      }
    }
  };

  const handleSearch = async (results: SmartRecommendation[]) => {
    setIsLoading(true);
    setShowWelcome(false);
    
    try {
      const startTime = performance.now();
      
      setSearchResults(results);
      
      // Update URL with search query
      if (currentQuery) {
        const url = new URL(window.location.href);
        url.searchParams.set('q', currentQuery);
        router.push(url.pathname + url.search, { scroll: false });
      }
      
      // Track search performance with defensive monitoring
      try {
        if (isFirebaseAvailable) {
          monitoringService.trackPerformanceBenchmark('search_execution', startTime);
          monitoringService.trackBusinessEvent('search_performed', {
            query: currentQuery,
            resultsCount: results.length,
            userId: user?.uid,
            hasFilters: false // Would track actual filter usage
          });
        }
      } catch (trackError) {
        console.warn('Failed to track search metrics:', trackError);
      }

      // Generate search analytics
      if (results.length > 0) {
        const analytics = generateSearchAnalytics(results);
        setSearchAnalytics(analytics);
      }

    } catch (error) {
      console.error('Search error:', error);
      
      // Safe error reporting
      try {
        if (isFirebaseAvailable) {
          monitoringService.reportError({
            message: 'Search execution failed',
            stack: error instanceof Error ? error.stack : undefined,
            url: window.location.href,
            userId: user?.uid,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            sessionId: monitoringService.getSessionMetrics().sessionId,
            additionalData: { query: currentQuery }
          });
        }
      } catch (reportError) {
        console.warn('Failed to report search error:', reportError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateSearchAnalytics = (results: SmartRecommendation[]) => {
    const totalResults = results.length;
    const avgMatchScore = results.reduce((sum, r) => sum + r.matchScore, 0) / totalResults;
    const topGenres = results
      .flatMap(r => r.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalResults,
      avgMatchScore: Math.round(avgMatchScore),
      topGenres: Object.entries(topGenres)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count })),
      searchQuality: avgMatchScore >= 80 ? 'Excellent' : avgMatchScore >= 60 ? 'Good' : 'Fair'
    };
  };

  const handleTrendingClick = (query: string) => {
    setCurrentQuery(query);
    try {
      if (isFirebaseAvailable) {
        monitoringService.trackBusinessEvent('trending_search_clicked', {
          query,
          userId: user?.uid
        });
      }
    } catch (error) {
      console.warn('Failed to track trending click:', error);
    }
  };

  const handleCategoryClick = (category: string) => {
    setCurrentQuery(category);
    try {
      if (isFirebaseAvailable) {
        monitoringService.trackBusinessEvent('category_search_clicked', {
          category,
          userId: user?.uid
        });
      }
    } catch (error) {
      console.warn('Failed to track category click:', error);
    }
  };

  const handleSaveCreator = async (creatorId: string) => {
    try {
      if (!isFirebaseAvailable) {
        alert('Creator saving is currently unavailable. Please try again later.');
        return;
      }

      await fetch('/api/user/saved-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      });
      
      monitoringService.trackBusinessEvent('creator_saved', {
        creatorId,
        fromSearch: true,
        query: currentQuery,
        userId: user?.uid
      });
    } catch (error) {
      console.error('Failed to save creator:', error);
    }
  };

  const handleMessageCreator = (creatorId: string) => {
    if (!isFirebaseAvailable) {
      alert('Messaging is currently unavailable. Please try again later.');
      return;
    }

    router.push(`/dashboard/messages?new=${creatorId}`);
    try {
      monitoringService.trackBusinessEvent('creator_message_initiated', {
        creatorId,
        fromSearch: true,
        query: currentQuery,
        userId: user?.uid
      });
    } catch (error) {
      console.warn('Failed to track message initiation:', error);
    }
  };

  const handleBookCreator = (creatorId: string) => {
    router.push(`/creators/${creatorId}/book`);
    try {
      if (isFirebaseAvailable) {
        monitoringService.trackBusinessEvent('booking_initiated', {
          creatorId,
          fromSearch: true,
          query: currentQuery,
          userId: user?.uid
        });
      }
    } catch (error) {
      console.warn('Failed to track booking initiation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Firebase Availability Warning */}
      {!isFirebaseAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Some features like saving creators and messaging are currently unavailable. 
                Search functionality is running with sample data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Compass className="w-8 h-8 mr-3 text-blue-600" />
                Discover Creators
                <span data-testid="smoke" className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  LOADED ✓
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered search to find the perfect music creators for your project
              </p>
            </div>
            
            {searchAnalytics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 rounded-lg p-4 min-w-[200px]"
              >
                <div className="text-sm font-medium text-blue-900 mb-1">Search Quality</div>
                <div className="text-2xl font-bold text-blue-600">{searchAnalytics.searchQuality}</div>
                <div className="text-xs text-blue-700">{searchAnalytics.avgMatchScore}% avg match</div>
              </motion.div>
            )}
          </div>

          {/* Advanced Search Interface */}
          <AdvancedSearchInterface
            onSearch={handleSearch}
            placeholder="Search for creators, genres, services, or describe your project..."
            className="w-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showWelcome ? (
          <WelcomeSection
            trendingSearches={trendingSearches}
            popularCategories={popularCategories}
            onTrendingClick={handleTrendingClick}
            onCategoryClick={handleCategoryClick}
          />
        ) : (
          <SmartSearchResults
            results={searchResults}
            isLoading={isLoading}
            query={currentQuery}
            onSaveCreator={handleSaveCreator}
            onMessageCreator={handleMessageCreator}
            onBookCreator={handleBookCreator}
          />
        )}
      </div>
    </div>
  );
};

// Welcome Section Component
interface WelcomeSectionProps {
  trendingSearches: TrendingSearch[];
  popularCategories: PopularCategory[];
  onTrendingClick: (query: string) => void;
  onCategoryClick: (category: string) => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  trendingSearches,
  popularCategories,
  onTrendingClick,
  onCategoryClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
        >
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">10K+</div>
          <div className="text-gray-600">Active Creators</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
        >
          <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">50K+</div>
          <div className="text-gray-600">Projects Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
        >
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">4.9</div>
          <div className="text-gray-600">Average Rating</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
        >
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">24h</div>
          <div className="text-gray-600">Avg Response Time</div>
        </motion.div>
      </div>

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Trending Searches</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingSearches.slice(0, 8).map((trend, index) => (
              <motion.button
                key={trend.query}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                onClick={() => onTrendingClick(trend.query)}
                className="p-4 text-left bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-100 hover:border-red-200 group"
              >
                <div className="font-medium text-gray-900 mb-1 group-hover:text-red-700 transition-colors">
                  {trend.query}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>{trend.category}</span>
                  <span className="text-red-600 font-medium">↗ {trend.growth}%</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Popular Categories</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCategories.slice(0, 6).map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onClick={() => onCategoryClick(category.name)}
                className="p-6 text-left bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100 hover:border-blue-200 group"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {category.name}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {category.description}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {category.count} creators available
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Ready to find your perfect music creator?</h2>
        <p className="text-blue-100 mb-6">
          Our AI-powered search helps you discover creators that match your exact needs, 
          style, and budget in seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
            🎵 Music Production
          </span>
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
            🎤 Vocal Recording
          </span>
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
            🎹 Beat Making
          </span>
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
            ✨ Mixing & Mastering
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedSearchPage;
