'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVerificationData } from '@/lib/hooks/useVerificationData';
import Link from 'next/link';
import { ArrowRight, Users, Calendar, MessageCircle, Shield, Settings, Trophy } from 'lucide-react';
import XPWidget from '@/components/gamification/XPWidget';
import { VerificationStatusWidget } from '@/components/verification/VerificationStatusWidget';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const { data: verificationData } = useVerificationData();

  if (!user) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {userData?.displayName || userData?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your account
        </p>
      </div>

      <NotificationsPanel />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData?.uid && <XPWidget showHistory={false} />}
        
        {verificationData && (
          <VerificationStatusWidget
            isVerified={verificationData.isVerified}
            isEligible={verificationData.isEligible}
            overallScore={verificationData.overallScore}
            applicationStatus={verificationData.applicationStatus}
            onViewDetails={() => {}}
            className="bg-neutral-800 border-neutral-700"
          />
        )}

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold">Profile Status</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
          </p>
          <p className="text-sm text-gray-400">
            {userData?.tier || 'Standard'} Tier
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/home"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Full Dashboard</h3>
                  <p className="text-sm text-gray-400">View detailed dashboard</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link 
            href="/dashboard/bookings"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Bookings</h3>
                  <p className="text-sm text-gray-400">Manage your bookings</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link 
            href="/dashboard/inbox"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Messages</h3>
                  <p className="text-sm text-gray-400">Check your inbox</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link 
            href="/dashboard/verification"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Verification</h3>
                  <p className="text-sm text-gray-400">Check verification status</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link 
            href="/dashboard/profile"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Users className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Profile</h3>
                  <p className="text-sm text-gray-400">Edit your profile</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link 
            href="/dashboard/settings"
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Settings className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Settings</h3>
                  <p className="text-sm text-gray-400">Account preferences</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Get Started Section for New Users */}
      {!verificationData?.isVerified && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Ready to Get Verified?</h2>
          <p className="text-gray-400 mb-4">
            Join our verified creator community and unlock premium features.
          </p>
          <Link 
            href="/apply"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Apply for Verification
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
