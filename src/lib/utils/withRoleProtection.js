"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export function withRoleProtection(Component, allowedRoles) {
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/auth/login');
        } else if (!allowedRoles.includes(user.role)) {
          router.push('/dashboard');
        }
      }
    }, [user, loading, router]);

    return <Component {...props} />;
  };
}
