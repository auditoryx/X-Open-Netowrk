'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  getAllVerifications, 
  approveVerification, 
  rejectVerification,
  updateUserVerificationStatus 
} from '@/lib/firestore/updateVerificationStatus';
import { 
  getVerificationStatus, 
  submitVerificationRequest 
} from '@/lib/firestore/submitVerificationRequest';
import VerificationReviewCard from '@/components/admin/VerificationReviewCard';

export default function TestAdminVerificationPage() {
  const { user, userData } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createSampleVerification = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Create a sample verification request
      await submitVerificationRequest(
        user.uid,
        {
          name: userData?.name || 'Test User',
          role: userData?.role || 'Test Role'
        },
        {
          statement: 'This is a test verification request for demonstration purposes. I have extensive experience in audio production and have worked with many high-profile clients.',
          links: [
            'https://portfolio.example.com',
            'https://instagram.com/testuser',
            'https://soundcloud.com/testuser'
          ]
        }
      );
      setMessage('✅ Sample verification request created!');
    } catch (error) {
      setMessage('❌ Error creating sample request');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const allVerifications = await getAllVerifications();
      setVerifications(allVerifications);
      setMessage(`✅ Fetched ${allVerifications.length} verification requests`);
    } catch (error) {
      setMessage('❌ Error fetching verifications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (userId: string, newStatus: 'approved' | 'rejected') => {
    setVerifications(prev => 
      prev.map(v => 
        v.userId === userId 
          ? { ...v, status: newStatus }
          : v
      )
    );
    setMessage(`✅ Verification ${newStatus} for user ${userId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Admin Verification System</h1>
          <p className="text-gray-600">Please log in to test the admin verification features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Verification System Test</h1>
          <p className="text-gray-600">Test the admin verification review and approval functionality</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">User ID:</span>
              <span className="ml-2 font-mono">{user.uid}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2">{user.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2">{userData?.role || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={createSampleVerification}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Sample Verification'}
              </button>

              <button
                onClick={fetchVerifications}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Loading...' : 'Fetch All Verifications'}
              </button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Verification Cards */}
        {verifications.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Verification Requests ({verifications.length})
            </h2>
            
            {verifications.map((verification) => (
              <VerificationReviewCard
                key={verification.userId}
                verification={verification}
                onStatusUpdate={handleStatusUpdate}
                adminUserId={user.uid}
              />
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/dashboard/admin/verifications"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Admin Dashboard</div>
              <div className="text-sm text-blue-600">Production admin interface</div>
            </a>
            <a
              href="/test-verification"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">User Verification</div>
              <div className="text-sm text-blue-600">Test user application flow</div>
            </a>
            <a
              href="/dashboard/home"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Dashboard</div>
              <div className="text-sm text-blue-600">Return to dashboard</div>
            </a>
          </div>
        </div>

        {/* API Testing */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Functions Available</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <code>getAllVerifications(status?)</code> - Fetch all verification requests</p>
            <p>• <code>approveVerification(userId, adminId, notes?)</code> - Approve a request</p>
            <p>• <code>rejectVerification(userId, adminId, notes)</code> - Reject a request</p>
            <p>• <code>updateUserVerificationStatus(userId, isVerified)</code> - Update user profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
