'use client';

import { UserProfile } from '@/types/user';
import TierBadge from '@/components/ui/TierBadge';

export default function RoleOverview({ profile }: { profile: UserProfile }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{profile.displayName}</h2>
          <p className="text-sm text-gray-400">{profile.role}</p>
        </div>
        {profile.proTier && <TierBadge tier={profile.proTier} />}
      </div>

      <div className="text-sm text-gray-300">
        Welcome back! You can edit your profile, manage availability, and accept bookings.
      </div>
    </div>
  );
}
