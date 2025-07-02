'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import RoleDashboardLayout from '@/components/dashboard/RoleDashboardLayout';
import BookingsPreview from '@/components/dashboard/BookingsPreview';
import MessagesPreview from '@/components/dashboard/MessagesPreview';
import MyServicesPreview from '@/components/dashboard/MyServicesPreview';

const validRoles = ['artist', 'producer', 'studio', 'videographer'];

export default function RoleDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const role = Array.isArray(params?.role) ? params.role[0] : params?.role;

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Validate role
    if (role && !validRoles.includes(role)) {
      router.push('/dashboard/home');
      return;
    }

    // Fetch user profile to get actual role
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        // You can implement getUserProfile helper or use existing one
        // For now, we'll use basic user data
        setUserProfile({
          name: user.displayName || user.email?.split('@')[0] || 'Creator',
          role: role,
          uid: user.uid
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user, authLoading, role, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Access denied</p>
        </div>
      </div>
    );
  }

  return (
    <RoleDashboardLayout role={role} userName={userProfile?.name}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {userProfile?.name}! 👋
          </h2>
          <p className="text-gray-400">
            Here's what's happening with your {role} business today.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <BookingsPreview role="provider" limit={5} />
            <MyServicesPreview limit={4} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MessagesPreview limit={5} />
            
            {/* Activity/Stats Section */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">4.8</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">$2,340</div>
                  <div className="text-sm text-gray-400">This Month</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">23</div>
                  <div className="text-sm text-gray-400">Reviews</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">89%</div>
                  <div className="text-sm text-gray-400">Response Rate</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">New booking request from Sarah M.</span>
                  <span className="text-gray-500">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Service "Beat Production" updated</span>
                  <span className="text-gray-500">5h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">New 5-star review received</span>
                  <span className="text-gray-500">1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
