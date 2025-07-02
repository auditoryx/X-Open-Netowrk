'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import BannedModal from '@/src/components/BannedModal';
import { Shield, Mail, LogOut, AlertCircle } from 'lucide-react';

export default function BannedPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect non-banned users
    if (user && userData && !userData.banned) {
      router.push('/dashboard');
      return;
    }
    
    // Redirect unauthenticated users
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [user, userData, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Don't render if user shouldn't be here
  if (!user || !userData?.banned) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Account Suspended
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              Your account has been temporarily suspended due to violations of our community guidelines.
            </p>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">What this means:</p>
                  <ul className="space-y-1 text-left">
                    <li>• You cannot access your dashboard</li>
                    <li>• Your profile is hidden from other users</li>
                    <li>• You cannot create new bookings or services</li>
                    <li>• Existing bookings may be affected</li>
                  </ul>
                </div>
              </div>
            </div>

            {userData.banReason && (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Reason:</span> {userData.banReason}
                </p>
                {userData.banExpiresAt && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-medium">Expires:</span>{' '}
                    {new Date(userData.banExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you believe this suspension was issued in error, please contact our support team.
              We'll review your case and respond within 24-48 hours.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need immediate assistance?{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Get help here
            </button>
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      <BannedModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={user}
        banReason={userData.banReason}
      />
    </div>
  );
}
