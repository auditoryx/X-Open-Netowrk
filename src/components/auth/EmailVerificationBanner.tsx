'use client';

import { useEmailVerification } from '@/hooks/useEmailVerification';
import Link from 'next/link';
import { useState } from 'react';

interface EmailVerificationBannerProps {
  className?: string;
}

export default function EmailVerificationBanner({ className = '' }: EmailVerificationBannerProps) {
  const { isVerified, isLoading, user, sendVerificationEmail } = useEmailVerification();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show banner if loading, no user, or email is verified
  if (isLoading || !user || isVerified) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
      setSent(true);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              Please verify your email address to access all features and secure your account.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSendVerification}
                disabled={isSending || sent}
                className="font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : sent ? 'Sent!' : 'Send Verification Email'}
              </button>
              <Link 
                href="/verify-email" 
                className="font-medium text-yellow-800 hover:text-yellow-900"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            {/* Could add a dismiss button here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}