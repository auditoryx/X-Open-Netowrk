'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import CompletionNotice from '@/components/onboarding/CompletionNotice';

export default function CreateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!session?.user?.email) return;

        if (!isFirebaseConfigured()) {
          console.warn('Firebase not configured, allowing profile creation in development mode');
          setFirebaseError('Database service unavailable - running in development mode');
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', session.user.email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push('/waitlist');
          return;
        }

        const userData = userSnap.data();
        const isApproved = userData?.approvedByAdmin === true || !!userData?.inviteCode;

        if (!isApproved) {
          router.push('/waitlist');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to check profile access:', error);
        setFirebaseError('Unable to verify access. Please try again later.');
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkAccess();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center text-center p-8">
        {firebaseError && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4 max-w-md">
            ⚠️ {firebaseError}
          </div>
        )}
        
        {!isFirebaseConfigured() && (
          <div className="bg-blue-900 text-blue-100 p-4 rounded-lg mb-4 max-w-md">
            ℹ️ Database service unavailable - profile creation in development mode
          </div>
        )}

        <CompletionNotice />
        <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
        <p className="text-gray-400">Complete your details and showcase your creative skills to the world.</p>
        
        <button 
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
          data-testid="smoke"
        >
          Profile Creation Available
        </button>
      </div>
    </div>
  );
}
