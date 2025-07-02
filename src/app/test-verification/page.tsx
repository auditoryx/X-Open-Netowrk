'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getVerificationStatus, canApplyForVerification } from '@/lib/firestore/submitVerificationRequest';
import ApplyVerificationButton from '@/components/profile/ApplyVerificationButton';

export default function TestVerificationPage() {
  const { user, userData } = useAuth();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const [status, canApply] = await Promise.all([
        getVerificationStatus(user.uid),
        canApplyForVerification(user.uid)
      ]);

      setVerificationData(status);
      setEligibility(canApply);
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.uid) {
      checkVerificationStatus();
    }
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Verification System</h1>
          <p className="text-gray-600">Please log in to test the verification features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification System Test</h1>
          <p className="text-gray-600">Test the verification application flow and status checking</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">User ID:</span>
              <span className="ml-2 font-mono">{user.uid}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2">{user.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2">{userData?.name || userData?.displayName || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2">{userData?.role || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
            <button
              onClick={checkVerificationStatus}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {verificationData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    verificationData.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : verificationData.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationData.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Applied:</span>
                  <span className="ml-2">{verificationData.createdAt.toDate().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 block mb-1">Statement:</span>
                <p className="text-sm bg-gray-50 p-3 rounded border">{verificationData.statement}</p>
              </div>
              
              <div>
                <span className="text-gray-600 block mb-1">Links:</span>
                <ul className="space-y-1">
                  {verificationData.links.map((link: string, index: number) => (
                    <li key={index}>
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {verificationData.reviewNotes && (
                <div>
                  <span className="text-gray-600 block mb-1">Review Notes:</span>
                  <p className="text-sm bg-red-50 p-3 rounded border border-red-200 text-red-700">
                    {verificationData.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No verification application found</p>
          )}
        </div>

        {/* Eligibility */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Eligibility</h2>
          {eligibility ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Can Apply:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  eligibility.canApply 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {eligibility.canApply ? 'Yes' : 'No'}
                </span>
              </div>
              {eligibility.reason && (
                <p className="text-sm text-gray-600">{eligibility.reason}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Checking eligibility...</p>
          )}
        </div>

        {/* Component Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Button Variant */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Component</h3>
            <ApplyVerificationButton
              userId={user.uid}
              userData={{
                name: userData?.name || userData?.displayName || 'Test User',
                role: userData?.role || 'Test Role',
                isVerified: userData?.isVerified || false
              }}
              variant="button"
            />
          </div>

          {/* Card Variant */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Component</h3>
            <ApplyVerificationButton
              userId={user.uid}
              userData={{
                name: userData?.name || userData?.displayName || 'Test User',
                role: userData?.role || 'Test Role',
                isVerified: userData?.isVerified || false
              }}
              variant="card"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/profile/edit"
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">Edit Profile</div>
              <div className="text-sm text-blue-600">See verification in profile edit</div>
            </a>
            <a
              href={`/profile/${user.uid}`}
              className="block p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-blue-900">View Profile</div>
              <div className="text-sm text-blue-600">See verification on your profile</div>
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
      </div>
    </div>
  );
}
