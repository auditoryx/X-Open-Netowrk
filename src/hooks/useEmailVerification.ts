import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export interface EmailVerificationStatus {
  isVerified: boolean | null;
  isLoading: boolean;
  user: any;
  sendVerificationEmail: () => Promise<void>;
}

export function useEmailVerification(): EmailVerificationStatus {
  const auth = getAuth(app);
  const [user, loading, error] = useAuthState(auth);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsVerified(null);
      setIsLoading(false);
      return;
    }

    // Check if email is verified
    setIsVerified(user.emailVerified);
    setIsLoading(false);
  }, [user, loading]);

  const sendVerificationEmail = async () => {
    if (!user || !user.email) {
      throw new Error('No user or email found');
    }

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send verification email');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  return {
    isVerified,
    isLoading,
    user,
    sendVerificationEmail
  };
}