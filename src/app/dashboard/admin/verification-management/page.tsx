/**
 * Enhanced Admin Verification Dashboard
 * Uses the new AdminVerificationDashboard component for improved UX
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import AdminVerificationDashboard from '@/components/verification/AdminVerificationDashboard';
import withAdminProtection from '@/middleware/withAdminProtection';

function EnhancedAdminVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage verification applications with comprehensive user insights
          </p>
        </div>
        
        <AdminVerificationDashboard />
      </div>
    </div>
  );
}

export default withAdminProtection(EnhancedAdminVerificationPage, { allowModerators: true });
