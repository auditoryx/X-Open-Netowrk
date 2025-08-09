'use client';

import React, { useState, useEffect } from 'react';
import { FeatureFlags, EXPLORE_ROLE_TABS, TIER_BADGES, getCredibilityVisibilityLevel, VISIBILITY_ACTION_HINTS } from '@/lib/featureFlags/axBeta';
import { UserProfile } from '@/types/user';
import { BadgeDisplay } from '@/types/badge';

interface ExploreResult {
  top: UserProfile[];
  rising: UserProfile[];
  newThisWeek: UserProfile[];
  metadata: {
    totalResults: number;
    filters: any;
    timestamp: string;
    mixRatios: {
      top: number;
      rising: number;
      newThisWeek: number;
    };
  };
}

interface ExplorePageProps {
  initialData?: ExploreResult;
}

export default function ExplorePage({ initialData }: ExplorePageProps) {
  const [activeRole, setActiveRole] = useState('artist');
  const [exploreData, setExploreData] = useState<ExploreResult | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Fetch explore data
  const fetchExploreData = async (role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/explore?role=${role}&limit=30`);
      if (!response.ok) {
        throw new Error('Failed to fetch explore data');
      }
      
      const data = await response.json();
      setExploreData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchExploreData(activeRole);
    }
  }, [activeRole, initialData]);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    fetchExploreData(role);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => fetchExploreData(activeRole)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Creators</h1>
          <p className="mt-2 text-gray-600">
            Discover talented {activeRole}s ready to work on your next project
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {EXPLORE_ROLE_TABS.map((role) => (
              <button
                key={role.key}
                onClick={() => handleRoleChange(role.key)}
                className={`${
                  activeRole === role.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Signature Carousel (if feature enabled) */}
        {FeatureFlags.isEnabled('EXPOSE_SCORE_V1') && exploreData && (
          <SignatureCarousel creators={exploreData.top.filter(c => c.tier === 'signature')} />
        )}

        {/* Results */}
        {exploreData && (
          <div className="space-y-8">
            {/* First Screen Mix or Single List */}
            {FeatureFlags.isEnabled('FIRST_SCREEN_MIX') ? (
              <FirstScreenMix exploreData={exploreData} />
            ) : (
              <CreatorGrid 
                title="Top Creators"
                creators={exploreData.top}
                showCredibilityScore={FeatureFlags.isEnabled('EXPOSE_SCORE_V1')}
              />
            )}

            {/* Debug Info */}
            {FeatureFlags.isEnabled('SHOW_DEBUG_INFO') && (
              <DebugInfo exploreData={exploreData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Signature Carousel Component */
function SignatureCarousel({ creators }: { creators: UserProfile[] }) {
  if (creators.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">👑</span>
        Signature Talent
      </h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {creators.slice(0, 5).map((creator) => (
          <div key={creator.uid} className="flex-none w-80">
            <CreatorCard creator={creator} featured={true} showCredibilityScore={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* First Screen Mix Component */
function FirstScreenMix({ exploreData }: { exploreData: ExploreResult }) {
  return (
    <div className="space-y-8">
      {exploreData.top.length > 0 && (
        <CreatorGrid 
          title="Top Creators"
          creators={exploreData.top}
          showCredibilityScore={FeatureFlags.isEnabled('EXPOSE_SCORE_V1')}
        />
      )}
      
      {exploreData.rising.length > 0 && (
        <CreatorGrid 
          title="Rising Talent"
          creators={exploreData.rising}
          showCredibilityScore={FeatureFlags.isEnabled('EXPOSE_SCORE_V1')}
          icon="🚀"
        />
      )}
      
      {exploreData.newThisWeek.length > 0 && (
        <CreatorGrid 
          title="New This Week"
          creators={exploreData.newThisWeek}
          showCredibilityScore={FeatureFlags.isEnabled('EXPOSE_SCORE_V1')}
          icon="✨"
        />
      )}
    </div>
  );
}

/* Creator Grid Component */
function CreatorGrid({ 
  title, 
  creators, 
  showCredibilityScore = false, 
  icon 
}: { 
  title: string;
  creators: UserProfile[];
  showCredibilityScore?: boolean;
  icon?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
        <span className="ml-2 text-sm text-gray-500">({creators.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <CreatorCard 
            key={creator.uid} 
            creator={creator} 
            showCredibilityScore={showCredibilityScore}
          />
        ))}
      </div>
    </div>
  );
}

/* Creator Card Component */
function CreatorCard({ 
  creator, 
  featured = false, 
  showCredibilityScore = false 
}: { 
  creator: UserProfile;
  featured?: boolean;
  showCredibilityScore?: boolean;
}) {
  const tierInfo = TIER_BADGES[creator.tier];
  const credibilityLevel = getCredibilityVisibilityLevel(creator.credibilityScore || 0);
  const topBadge = creator.badgeIds?.[0]; // Show first badge for now
  const axCredits = creator.counts?.axVerifiedCredits || 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
      featured ? 'ring-2 ring-indigo-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {creator.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{creator.name}</h3>
            <p className="text-sm text-gray-500">{creator.timezone}</p>
          </div>
        </div>
        
        {/* Tier Badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierInfo.color}`}>
          {tierInfo.icon} {tierInfo.label}
        </span>
      </div>

      {/* Bio */}
      {creator.bio && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {creator.bio}
        </p>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          {/* AX-Verified Credits */}
          <span className="flex items-center">
            <span className="text-indigo-600 font-medium">AX-Verified</span>
            <span className="ml-1">• {axCredits}</span>
          </span>
          
          {/* Completion Stats */}
          {creator.stats?.completedBookings && (
            <span>{creator.stats.completedBookings} completed</span>
          )}
        </div>

        {/* Top Badge */}
        {topBadge && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {/* This would show actual badge icon/name from badge definitions */}
            🏆 Badge
          </span>
        )}
      </div>

      {/* Credibility/Visibility Indicator */}
      {showCredibilityScore && FeatureFlags.isEnabled('CREDIBILITY_VISIBILITY') && (
        <div className="mb-4">
          <VisibilityMeter 
            level={credibilityLevel}
            score={creator.credibilityScore || 0}
          />
        </div>
      )}

      {/* Action Button */}
      <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
        View Profile
      </button>
    </div>
  );
}

/* Visibility Meter Component */
function VisibilityMeter({ level, score }: { level: string; score: number }) {
  const colors = {
    low: 'bg-red-100 text-red-800',
    moderate: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-green-100 text-green-800'
  };

  const hints = VISIBILITY_ACTION_HINTS[level as keyof typeof VISIBILITY_ACTION_HINTS];
  const randomHint = hints[Math.floor(Math.random() * hints.length)];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">Visibility</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>
      {level !== 'high' && (
        <p className="text-xs text-gray-500 italic">
          💡 {randomHint}
        </p>
      )}
    </div>
  );
}

/* Debug Info Component */
function DebugInfo({ exploreData }: { exploreData: ExploreResult }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-2">Debug Info</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Total Results: {exploreData.metadata.totalResults}</p>
        <p>Mix Ratios: Top {(exploreData.metadata.mixRatios.top * 100).toFixed(1)}%, Rising {(exploreData.metadata.mixRatios.rising * 100).toFixed(1)}%, New {(exploreData.metadata.mixRatios.newThisWeek * 100).toFixed(1)}%</p>
        <p>Timestamp: {exploreData.metadata.timestamp}</p>
        <p>Feature Flags: EXPOSE_SCORE_V1={FeatureFlags.isEnabled('EXPOSE_SCORE_V1').toString()}, FIRST_SCREEN_MIX={FeatureFlags.isEnabled('FIRST_SCREEN_MIX').toString()}</p>
      </div>
    </div>
  );
}