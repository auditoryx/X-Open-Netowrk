'use client';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ComponentType } from 'react';

export function withRoleProtection<T extends object>(Component: ComponentType<T>, allowedRoles: string[]) {
  return function ProtectedPage(props: T): JSX.Element {
    const router = useRouter();

    useEffect(() => {
      const auth = getAuth(app);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push('/');
          return;
        }

        const token = await user.getIdTokenResult();
        const userRole = token.claims.role as string;

        if (!allowedRoles.includes(userRole)) {
          router.push('/');
        }
      });

      return () => unsubscribe();
    }, [router]);

    return <Component {...props} />;
  };
}
