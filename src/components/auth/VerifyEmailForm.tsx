'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailForm() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    success: boolean;
    message: string;
    email?: string;
  }>({ success: false, message: '' });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode') || '';

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setVerificationStatus({
          success: false,
          message: 'Invalid verification link. Missing verification code.'
        });
        setIsVerifying(false);
        return;
      }

      try {
        // First check if the code is valid
        const checkResponse = await fetch(`/api/auth/verify-email?oobCode=${oobCode}`);
        const checkResult = await checkResponse.json();

        if (!checkResponse.ok) {
          setVerificationStatus({
            success: false,
            message: checkResult.error || 'Invalid verification link.'
          });
          setIsVerifying(false);
          return;
        }

        // If valid, proceed with verification
        const verifyResponse = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ oobCode })
        });

        const verifyResult = await verifyResponse.json();

        if (verifyResponse.ok) {
          setVerificationStatus({
            success: true,
            message: verifyResult.message || 'Email verified successfully!',
            email: checkResult.email
          });
          
          // Redirect to dashboard after successful verification
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setVerificationStatus({
            success: false,
            message: verifyResult.error || 'Email verification failed.'
          });
        }
      } catch (error) {
        setVerificationStatus({
          success: false,
          message: 'Network error occurred. Please try again.'
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [oobCode, router]);

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Your Email
          </h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus.success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verified!
          </h2>
          
          <p className="text-gray-600 mb-4">
            {verificationStatus.message}
          </p>
          
          {verificationStatus.email && (
            <p className="text-sm text-gray-500 mb-6">
              Verified: {verificationStatus.email}
            </p>
          )}
          
          <div className="space-y-3">
            <Link 
              href="/dashboard" 
              className="block w-full btn btn-primary text-center"
            >
              Continue to Dashboard
            </Link>
            
            <p className="text-sm text-gray-500">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verification failed
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verification Failed
        </h2>
        
        <p className="text-gray-600 mb-6">
          {verificationStatus.message}
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/verify-email" 
            className="block w-full btn btn-primary text-center"
          >
            Request New Verification Email
          </Link>
          
          <Link 
            href="/login" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}