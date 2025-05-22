'use client';
import { UserProfile } from '@/types/user';

export default function DashboardRoleOverview({ profile }: { profile: UserProfile }) {
  return (
    <div className="mb-6 p-4 border border-white/20 rounded-lg bg-neutral-900">
      <h2 className="text-xl font-bold mb-1">Welcome, {profile.name || 'creator'} 👋</h2>
      <p className="text-sm text-gray-400">Here’s a quick overview of your dashboard.</p>
    </div>
  );
}
