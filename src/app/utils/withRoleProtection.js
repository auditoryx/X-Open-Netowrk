'use client';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export function withRoleProtection(Component, allowedRoles) {
  return function ProtectedPage(props) {
    const router = useRouter();

    useEffect(() => {
      const auth = getAuth(app);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push('/');
          return;
        }

        const token = await user.getIdTokenResult();
        const userRole = token.claims.role;

        if (!allowedRoles.includes(userRole)) {
          router.push('/');
        }
      });

      return () => unsubscribe();
    }, [router]);

    return <Component {...props} />;
  };
}
