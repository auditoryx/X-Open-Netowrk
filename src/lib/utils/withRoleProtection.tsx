'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

type Role = 'client' | 'provider' | 'admin'; // Update with actual roles
type WithRoleProtectionProps = {
  [key: string]: any;
};

export function withRoleProtection<P extends WithRoleProtectionProps>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[]
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/auth/login');
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