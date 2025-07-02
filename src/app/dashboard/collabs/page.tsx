'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import CollabDashboard from '@/components/dashboard/collab/CollabDashboard';
import RoleDashboardLayout from '@/components/dashboard/RoleDashboardLayout';

export default function CollabsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your collaboration dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <RoleDashboardLayout>
      <CollabDashboard />
    </RoleDashboardLayout>
  );
}
