'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CompletionNotice from '@/components/onboarding/CompletionNotice';

export default function CreateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user?.email) return;

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
        <CompletionNotice />
        <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
        <p className="text-gray-400">Complete your details and showcase your creative skills to the world.</p>
      </div>
    </div>
  );
}
