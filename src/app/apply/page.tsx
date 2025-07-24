'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVerificationData } from '@/lib/hooks/useVerificationData';
import { useState, useEffect } from 'react';
import { Shield, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ApplyPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { data: verificationData, submitApplication, canApply } = useVerificationData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/apply');
    }
  }, [user, router]);

  const handleSubmitApplication = async () => {
    try {
      setIsSubmitting(true);
      await submitApplication();
      alert('Application submitted successfully! We will review it and get back to you.');
      router.push('/dashboard/verification');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-900 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Apply for Verification</h1>
          <p className="text-lg text-gray-400 mb-2">
            Join the verified creator community on AuditoryX
          </p>
          <p className="text-center text-sm text-gray-400">
            Get verified to unlock premium features and increase your visibility
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Current Status */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Current Status
            </h2>
            
            {verificationData?.isVerified ? (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Already Verified</span>
              </div>
            ) : verificationData?.applicationStatus === 'pending' ? (
              <div className="flex items-center gap-3 text-yellow-400">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Application Under Review</span>
              </div>
            ) : verificationData?.applicationStatus === 'rejected' ? (
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Application Rejected</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                <span className="font-medium">Not Yet Applied</span>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Verification Requirements</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Complete Profile</span>
                <span className="text-sm text-gray-400">
                  {verificationData?.criteria?.profileCompleteness?.current || 0}% / {verificationData?.criteria?.profileCompleteness?.required || 80}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">XP Earned</span>
                <span className="text-sm text-gray-400">
                  {verificationData?.criteria?.xp?.current || 0} / {verificationData?.criteria?.xp?.required || 100}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Completed Bookings</span>
                <span className="text-sm text-gray-400">
                  {verificationData?.criteria?.completedBookings?.current || 0} / {verificationData?.criteria?.completedBookings?.required || 5}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Average Rating</span>
                <span className="text-sm text-gray-400">
                  {verificationData?.criteria?.averageRating?.current?.toFixed(1) || '0.0'} / {verificationData?.criteria?.averageRating?.required?.toFixed(1) || '4.0'} ★
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Verification Benefits</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-medium">Verified Badge</h3>
                  <p className="text-sm text-gray-400">Display a verification badge on your profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-medium">Higher Search Ranking</h3>
                  <p className="text-sm text-gray-400">Appear higher in search results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-medium">Premium Features</h3>
                  <p className="text-sm text-gray-400">Access to exclusive creator tools</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-medium">Increased Trust</h3>
                  <p className="text-sm text-gray-400">Build credibility with potential clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            {verificationData?.isVerified ? (
              <div className="space-y-4">
                <p className="text-green-400 font-medium">🎉 You are already verified!</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : verificationData?.applicationStatus === 'pending' ? (
              <div className="space-y-4">
                <p className="text-yellow-400 font-medium">Your application is under review</p>
                <button
                  onClick={() => router.push('/dashboard/verification')}
                  className="w-full bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  View Application Status
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : canApply ? (
              <button
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded font-semibold flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400 font-medium">You don't meet the requirements yet</p>
                <button
                  onClick={() => router.push('/dashboard/verification')}
                  className="w-full bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  View Progress & Requirements
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
