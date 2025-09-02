'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';
import { ComponentType } from 'react';

export default function withAuth<T extends object>(Component: ComponentType<T>) {
  return function AuthWrapped(props: T) {
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (loading) return <p className="text-white">Loading...</p>;

    return <Component {...props} />;
  };
}
