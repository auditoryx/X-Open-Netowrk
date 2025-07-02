'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Shield, UserX, AlertTriangle } from 'lucide-react';
import { isUserVerified, hasSignatureTier, isUserBanned, meetsMinimumTier } from '@/lib/utils/checkUserAccess';

type Role =
  | 'client'
  | 'provider'
  | 'admin'
  | 'artist'
  | 'engineer'
  | 'producer'
  | 'studio'
  | 'videographer'
  | 'moderator';

interface RoleProtectionOptions {
  requireVerified?: boolean;
  requireSignatureTier?: boolean;
  redirectTo?: string;
  allowBanned?: boolean;
  showAccessDenied?: boolean;
}

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[],
  options: RoleProtectionOptions = {}
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [denialReason, setDenialReason] = useState('');

    const {
      requireVerified = false,
      requireSignatureTier = false,
      redirectTo = '/dashboard',
      allowBanned = false,
      showAccessDenied = true
    } = options;

    useEffect(() => {
      if (loading) return;

      // Redirect to login if not authenticated
      if (!user) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Check for banned users (unless explicitly allowed)
      if (!allowBanned && isUserBanned(userData)) {
        router.push('/banned');
        return;
      }

      // Check role access
      const userRole = userData?.role || user.role;
      const hasRequiredRole = allowedRoles.includes(userRole as Role);

      if (!hasRequiredRole) {
        setDenialReason(`This page requires one of the following roles: ${allowedRoles.join(', ')}`);
        if (showAccessDenied) {
          setAccessDenied(true);
          setChecking(false);
        } else {
          router.push(redirectTo);
        }
        return;
      }

      // Check verification requirement using improved utility
      if (requireVerified && !isUserVerified(userData)) {
        setDenialReason('This page requires a verified account. Please complete the verification process first.');
        if (showAccessDenied) {
          setAccessDenied(true);
          setChecking(false);
        } else {
          router.push('/profile/verification');
        }
        return;
      }

      // Check signature tier requirement using improved utility
      if (requireSignatureTier && !hasSignatureTier(userData)) {
        setDenialReason('This page requires Signature tier access. Please upgrade your account to access these features.');
        if (showAccessDenied) {
          setAccessDenied(true);
          setChecking(false);
        } else {
          router.push('/upgrade');
        }
        return;
      }

      // Access granted
      setChecking(false);
    }, [user, userData, loading, router, allowedRoles, requireVerified, requireSignatureTier, redirectTo, allowBanned, showAccessDenied]);

    // Show loading state
    if (loading || checking) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
          </div>
        </div>
      );
    }

    // Show access denied page
    if (accessDenied) {
      const getIcon = () => {
        if (userData?.banned) return UserX;
        if (requireVerified || requireSignatureTier) return AlertTriangle;
        return Shield;
      };

      const Icon = getIcon();

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Access Restricted
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {denialReason}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-2">Access Requirements:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Role: {allowedRoles.join(' or ')}</li>
                    {requireVerified && <li>• Verified account status</li>}
                    {requireSignatureTier && <li>• Signature tier subscription</li>}
                    {!allowBanned && <li>• Account in good standing</li>}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-3">
                {requireVerified && !userData?.verified && (
                  <button
                    onClick={() => router.push('/profile/verification')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Apply for Verification
                  </button>
                )}
                
                {requireSignatureTier && !userData?.signature && (
                  <button
                    onClick={() => router.push('/upgrade')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Upgrade to Signature
                  </button>
                )}
                
                <button
                  onClick={() => router.push(redirectTo)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
                
                <button
                  onClick={() => router.push('/contact')}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render the protected component
    return <Component {...props} />;
  };
}

// Convenience functions for common protection patterns
export const withVerifiedUserOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, ['artist', 'producer', 'engineer', 'studio', 'videographer'], {
    requireVerified: true
  });

export const withSignatureTierOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, ['artist', 'producer', 'engineer', 'studio', 'videographer'], {
    requireSignatureTier: true
  });

export const withAdminOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, ['admin']);

export const withModeratorOrAdmin = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, ['admin', 'moderator']);

// Usage examples:
// const ProtectedPage = withRoleProtection(MyComponent, ['admin', 'provider']);
// const VerifiedOnlyPage = withVerifiedUserOnly(MyComponent);
// const SignatureOnlyPage = withSignatureTierOnly(MyComponent);
// 
// This HOC checks if the user is authenticated and has the required role.
// If not, it redirects them to the appropriate page or shows an access denied message.
// It uses the useAuth hook to get the user and loading state.