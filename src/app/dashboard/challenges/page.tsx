/**
 * Challenge Dashboard Page
 * 
 * Main dashboard for viewing and participating in challenges.
 * Displays active challenges, user progress, and leaderboards.
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

export const dynamic = 'force-dynamic';

// Dynamically import the entire challenge dashboard to avoid SSR issues
const ChallengeDashboardClient = dynamic(
  () => import('@/components/challenges/ChallengeDashboardClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }
);

export default function ChallengeDashboardPage() {
  return <ChallengeDashboardClient />;
}
