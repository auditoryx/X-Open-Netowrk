import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface WithEmailVerificationOptions {
  redirectTo?: string;
  requireVerification?: boolean;
}

export function withEmailVerification<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithEmailVerificationOptions = {}
) {
  const { redirectTo = '/verify-email', requireVerification = true } = options;

  return function WithEmailVerificationComponent(props: P) {
    const { isVerified, isLoading, user } = useEmailVerification();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      // If no user, let the auth protection handle it
      if (!user) return;

      // If email verification is required and user is not verified
      if (requireVerification && !isVerified) {
        router.push(redirectTo);
        return;
      }
    }, [isVerified, isLoading, user, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // If no user, don't render (let auth protection handle)
    if (!user) {
      return null;
    }

    // If verification required but not verified, don't render (redirect is in useEffect)
    if (requireVerification && !isVerified) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Utility function to check if user's email is verified
export function requireEmailVerification(requiredActions: string[] = []) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      // This would need to be used in API routes
      // You'd check the user's email verification status here
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}