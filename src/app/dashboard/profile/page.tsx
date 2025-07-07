'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import XPWidget from '@/components/gamification/XPWidget';
import Link from 'next/link';

export default function DashboardProfilePage() {
  const { userData } = useAuth();

  if (!userData) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      
      {/* Profile Info */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <p className="mb-2">Name: {userData.name || userData.displayName || 'Unnamed'}</p>
        <p className="mb-4">Bio: {userData.bio || 'No bio yet.'}</p>
        <Link href="/dashboard/edit" className="text-blue-400 underline">
          Edit Profile
        </Link>
      </div>

      {/* XP Progress */}
      <div>
        <h2 className="text-xl font-bold mb-4">Experience & Progress</h2>
        <XPWidget showHistory={true} />
      </div>
    </div>
  );
}
