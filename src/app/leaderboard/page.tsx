'use client';

import { useState } from 'react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Trophy, Users, Target, AlertCircle } from 'lucide-react';

// Firebase availability check
let isFirebaseAvailable = false;
try {
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

const ROLES = [
  { key: 'all', label: 'All Creators', icon: Users },
  { key: 'influencer', label: 'Influencers', icon: Target },
  { key: 'freelancer', label: 'Freelancers', icon: Target },
  { key: 'tutor', label: 'Tutors', icon: Target },
  { key: 'consultant', label: 'Consultants', icon: Target },
  { key: 'coach', label: 'Coaches', icon: Target }
];

export default function LeaderboardPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Firebase Availability Warning */}
      {!isFirebaseAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Leaderboard data is currently unavailable. 
                This page is running in demonstration mode with sample data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">
              Creator Leaderboard
              <span data-testid="smoke" className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                LOADED ✓
              </span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Discover the top performers and rising stars in our creator community
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {ROLES.map((role) => {
            const IconComponent = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === role.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <Leaderboard
            role={selectedRole === 'all' ? undefined : selectedRole}
            timeframe="allTime"
            maxEntries={50}
            className="bg-gray-900/50 rounded-xl p-6 border border-gray-700"
          />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Rankings are based on total XP earned through completed bookings, positive reviews, and community engagement.
          </p>
          <p className="text-xs mt-2">
            Leaderboard updates every hour • Last updated: Now
          </p>
        </div>
      </div>
    </div>
  );
}
