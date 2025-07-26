/**
 * KYC Verification Pending Page
 * 
 * Shows verification status and allows users to track progress
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface VerificationStatus {
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'canceled';
  sessionId?: string;
  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  canRetry?: boolean;
  retryCount?: number;
  cooldownUntil?: string;
}

export default function VerificationPendingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    loadVerificationStatus();
    
    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      if (verificationStatus?.status === 'processing' || verificationStatus?.status === 'pending') {
        loadVerificationStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      // In production, this would call a real API
      // For now, simulate different statuses
      const mockStatus: VerificationStatus = {
        status: 'processing',
        sessionId: 'vs_test_123',
        submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        retryCount: 0,
        canRetry: true,
      };
      
      setVerificationStatus(mockStatus);
    } catch (error) {
      console.error('Error loading verification status:', error);
      toast.error('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const retryVerification = async () => {
    setRetryLoading(true);
    try {
      const response = await fetch('/api/kyc/start-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retry verification');
      }

      if (data.verification?.url) {
        window.location.href = data.verification.url;
      } else {
        toast.error('Invalid verification session');
      }
    } catch (error: any) {
      console.error('Error retrying verification:', error);
      toast.error(error.message || 'Failed to retry verification');
    } finally {
      setRetryLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'processing':
        return <Clock className="h-16 w-16 text-blue-500" />;
      case 'canceled':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <Clock className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verification Complete!';
      case 'rejected':
        return 'Verification Not Approved';
      case 'processing':
        return 'Verification in Progress';
      case 'canceled':
        return 'Verification Canceled';
      default:
        return 'Verification Status';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Your identity has been successfully verified. You now have access to all premium features.';
      case 'rejected':
        return 'We were unable to verify your identity with the provided documents. Please try again with clearer photos.';
      case 'processing':
        return 'Our verification team is reviewing your documents. This usually takes a few minutes but can take up to 24 hours during busy periods.';
      case 'canceled':
        return 'Your verification session was canceled. You can start a new verification process at any time.';
      default:
        return 'Please wait while we check your verification status.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (!verificationStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Verification Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't started the verification process yet.
          </p>
          <button
            onClick={() => router.push('/verification/start')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          {getStatusIcon(verificationStatus.status)}
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            {getStatusTitle(verificationStatus.status)}
          </h1>
          <p className="text-lg text-gray-600">
            {getStatusDescription(verificationStatus.status)}
          </p>
        </div>

        {/* Status Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Details
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className={`text-sm font-medium ${
                verificationStatus.status === 'verified' ? 'text-green-600' :
                verificationStatus.status === 'rejected' ? 'text-red-600' :
                verificationStatus.status === 'processing' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {verificationStatus.status.charAt(0).toUpperCase() + verificationStatus.status.slice(1)}
              </span>
            </div>

            {verificationStatus.sessionId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Session ID</span>
                <span className="text-sm font-mono text-gray-900">
                  {verificationStatus.sessionId}
                </span>
              </div>
            )}

            {verificationStatus.submittedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="text-sm text-gray-900">
                  {new Date(verificationStatus.submittedAt).toLocaleString()}
                </span>
              </div>
            )}

            {verificationStatus.completedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Completed</span>
                <span className="text-sm text-gray-900">
                  {new Date(verificationStatus.completedAt).toLocaleString()}
                </span>
              </div>
            )}

            {verificationStatus.retryCount !== undefined && verificationStatus.retryCount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Retry Count</span>
                <span className="text-sm text-gray-900">
                  {verificationStatus.retryCount}
                </span>
              </div>
            )}
          </div>

          {verificationStatus.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-1">
                Rejection Reason
              </h4>
              <p className="text-sm text-red-700">
                {verificationStatus.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {verificationStatus.status === 'verified' && (
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {(verificationStatus.status === 'rejected' || verificationStatus.status === 'canceled') && 
           verificationStatus.canRetry && (
            <div className="text-center">
              <button
                onClick={retryVerification}
                disabled={retryLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {retryLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting New Verification...
                  </div>
                ) : (
                  'Try Again'
                )}
              </button>
              
              {verificationStatus.cooldownUntil && (
                <p className="text-sm text-gray-500 mt-2">
                  You can retry after {new Date(verificationStatus.cooldownUntil).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {verificationStatus.status === 'processing' && (
            <div className="text-center">
              <button
                onClick={loadVerificationStatus}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Check Status
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Status updates automatically every 30 seconds
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Need Help?
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                If you're experiencing issues with verification, please contact our support team. 
                Include your session ID for faster assistance.
              </p>
              <button
                onClick={() => router.push('/support')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}