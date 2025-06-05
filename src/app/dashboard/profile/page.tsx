'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function DashboardProfilePage() {
  const { userData } = useAuth();

  if (!userData) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p className="mb-2">Name: {userData.name || userData.displayName || 'Unnamed'}</p>
      <p className="mb-4">Bio: {userData.bio || 'No bio yet.'}</p>
      <Link href="/dashboard/edit" className="text-blue-400 underline">
        Edit Profile
      </Link>
    </div>
  );
}
