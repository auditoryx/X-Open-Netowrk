'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

type Role =
  | 'client'
  | 'provider'
  | 'admin'
  | 'artist'
  | 'engineer'
  | 'producer'
  | 'studio'
  | 'videographer';
type WithRoleProtectionPropsInternal<P> = P & {
  user?: { role: Role };
  loading?: boolean;
};

export function withRoleProtection<P extends WithRoleProtectionPropsInternal<P>>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[]
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (!allowedRoles.includes(user.role)) {
          router.push('/dashboard'); // Optional: make this customizable
        }
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return null; // or a loading spinner
    }

    return <Component {...props} />;
  };
}
// Usage example:
// const ProtectedPage = withRoleProtection(MyComponent, ['admin', 'provider']);
// export default ProtectedPage;
// This HOC checks if the user is authenticated and has the required role.
// If not, it redirects them to the login page or a different page.
// It uses the useAuth hook to get the user and loading state.
// The component will only render if the user is authenticated and has the required role.
// This HOC can be used to protect any page or component in the application.