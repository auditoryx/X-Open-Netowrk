'use client';

import { useState } from 'react';
import BadgeCard from '@/components/gamification/BadgeCard';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import BadgeProgress from '@/components/gamification/BadgeProgress';
import BadgeNotification from '@/components/gamification/BadgeNotification';
import { useBadgeData } from '@/lib/hooks/useBadgeData';
import { Timestamp } from 'firebase/firestore';

// Mock badge data for testing
const mockBadges = [
  {
    badgeId: 'session_starter',
    name: 'Session Starter',
    description: 'Complete your first booking session',
    iconUrl: '/badges/session-starter.svg',
    category: 'milestone',
    rarity: 'common',
    progress: { current: 1, target: 1, percentage: 100 },
    isEarned: true,
    awardedAt: Timestamp.now()
  },
  {
    badgeId: 'certified_mix',
    name: 'Certified Mix',
    description: 'Receive your first 5-star review',
    iconUrl: '/badges/certified-mix.svg',
    category: 'achievement',
    rarity: 'rare',
    progress: { current: 0, target: 1, percentage: 0 },
    isEarned: false
  },
  {
    badgeId: 'studio_regular',
    name: 'Studio Regular',
    description: 'Complete 10 projects',
    iconUrl: '/badges/studio-regular.svg',
    category: 'milestone',
    rarity: 'epic',
    progress: { current: 7, target: 10, percentage: 70 },
    isEarned: false
  },
  {
    badgeId: 'verified_pro',
    name: 'Verified Pro',
    description: 'Achieve Verified tier status',
    iconUrl: '/badges/verified-pro.svg',
    category: 'tier',
    rarity: 'legendary',
    progress: { current: 0, target: 1, percentage: 0 },
    isEarned: false
  }
] as any;

export default function BadgeTestPage() {
  const { badges, loading, error } = useBadgeData();
  const [showNotification, setShowNotification] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Use real data if available, otherwise use mock data
  const badgeData = badges.length > 0 ? badges : mockBadges;

  return (
    <div className="p-6 space-y-8 bg-neutral-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Badge System Test Page</h1>

        {/* Controls */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">Size:</label>
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as any)}
                className="px-3 py-1 bg-neutral-700 text-white rounded border border-neutral-600"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowNotification(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Test Badge Notification
            </button>
          </div>
        </div>

        {/* Individual Badge Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Individual Badge Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badgeData.map((badge) => (
              <BadgeCard
                key={badge.badgeId}
                badgeId={badge.badgeId}
                name={badge.name}
                description={badge.description}
                iconUrl={badge.iconUrl}
                category={badge.category}
                rarity={badge.rarity}
                progress={badge.progress}
                isEarned={badge.isEarned}
                awardedAt={badge.awardedAt}
                size={selectedSize}
              />
            ))}
          </div>
        </section>

        {/* Badge Grid Component */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Badge Grid Component</h2>
          <div className="bg-white rounded-lg p-6">
            <BadgeGrid
              badges={badgeData}
              loading={loading}
              error={error}
              showFilters={true}
              showSearch={true}
              size={selectedSize}
              maxCols={4}
            />
          </div>
        </section>

        {/* Badge Progress Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">In-Progress Badges</h2>
            <div className="bg-white rounded-lg p-6">
              <BadgeProgress 
                badges={badgeData}
                title="Next Badges to Earn"
                maxVisible={5}
                showCompleted={false}
                compact={false}
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Earned Badges (Compact)</h2>
            <div className="bg-white rounded-lg p-6">
              <BadgeProgress 
                badges={badgeData}
                title="Recently Earned"
                maxVisible={5}
                showCompleted={true}
                compact={true}
              />
            </div>
          </section>
        </div>

        {/* Data Status */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Data Status</h2>
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <div className="text-white space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Badge Count:</strong> {badgeData.length}</p>
              <p><strong>Earned Count:</strong> {badgeData.filter(b => b.isEarned).length}</p>
              <p><strong>In Progress Count:</strong> {badgeData.filter(b => !b.isEarned && b.progress.percentage > 0).length}</p>
              <p><strong>Data Source:</strong> {badges.length > 0 ? 'Real badge service' : 'Mock data'}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Badge Notification */}
      {showNotification && (
        <BadgeNotification
          badgeId="studio_regular"
          name="Studio Regular"
          description="Complete 10 projects"
          iconUrl="/badges/studio-regular.svg"
          rarity="epic"
          xpBonus={150}
          isVisible={true}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}
