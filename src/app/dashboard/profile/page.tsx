'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import XPWidget from '@/components/gamification/XPWidget';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import BadgeProgress from '@/components/gamification/BadgeProgress';
import VerificationStatusWidget from '@/components/verification/VerificationStatusWidget';
import { useBadgeData } from '@/lib/hooks/useBadgeData';
import { useVerificationData } from '@/lib/hooks/useVerificationData';
import Link from 'next/link';

export default function DashboardProfilePage() {
  const { userData } = useAuth();
  const { badges, loading: badgesLoading, error: badgesError } = useBadgeData();
  const { status, loading: verificationLoading } = useVerificationData();

  if (!userData) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      
      {/* Profile Info */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="mb-2">Name: {userData.name || userData.displayName || 'Unnamed'}</p>
            <p className="mb-4">Bio: {userData.bio || 'No bio yet.'}</p>
            <Link href="/dashboard/edit" className="text-blue-400 underline">
              Edit Profile
            </Link>
          </div>
          {/* Verification Status */}
          <div className="ml-4">
            <VerificationStatusWidget 
              status={status}
              loading={verificationLoading}
              showProgress={true}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div>
        <h2 className="text-xl font-bold mb-4">Experience & Progress</h2>
        <XPWidget showHistory={true} />
      </div>

      {/* Verification Section */}
      {(status?.isEligible || status?.currentApplication) && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verification Status
          </h3>
          <VerificationStatusWidget 
            status={status}
            loading={verificationLoading}
            showProgress={true}
            showDetails={true}
          />
          {status?.currentApplication && (
            <div className="mt-3">
              <Link 
                href="/dashboard/verification" 
                className="text-blue-400 underline text-sm"
              >
                View Full Verification Details →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Badge Progress */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <BadgeProgress 
          badges={badges}
          title="Next Badges"
          maxVisible={3}
          showCompleted={false}
          compact={true}
        />
      </div>

      {/* Badge Collection */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <BadgeGrid
          badges={badges}
          loading={badgesLoading}
          error={badgesError}
          showFilters={true}
          showSearch={false}
          size="medium"
          maxCols={4}
        />
      </div>
    </div>
  );
}
