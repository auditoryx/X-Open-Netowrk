'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
  return function AuthWrapped(props) {
    const [loading, setLoading] = useState(true);
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
