'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function withAdminProtection(Component: any) {
  return function ProtectedComponent(props: any) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (user && !user.admin) {
        router.push('/'); // Redirect non-admins to home
      }
    }, [user]);

    return user?.admin ? <Component {...props} /> : null;
  };
}
