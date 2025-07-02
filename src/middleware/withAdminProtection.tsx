'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { checkAdminAccess } from '@/lib/auth/withAdminCheck';
import { Shield, AlertCircle } from 'lucide-react';

interface AdminProtectionOptions {
  allowModerators?: boolean;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export default function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: AdminProtectionOptions = {}
) {
  return function ProtectedComponent(props: P) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    const {
      allowModerators = true,
      redirectTo = '/dashboard',
      showAccessDenied = true
    } = options;

    useEffect(() => {
      if (loading) return;

      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // Check for banned users
      if (userData?.banned) {
        router.push('/banned');
        return;
      }

      // Check admin access
      const adminCheck = checkAdminAccess(user);
      
      if (!adminCheck.isAdmin) {
        // If moderators are allowed, check if user is a moderator
        if (allowModerators && userData?.role === 'moderator') {
          setChecking(false);
          return;
        }

        // Access denied
        if (showAccessDenied) {
          setAccessDenied(true);
          setChecking(false);
        } else {
          router.push(redirectTo);
        }
        return;
      }

      // Access granted
      setChecking(false);
    }, [user, userData, loading, router, allowModerators, redirectTo, showAccessDenied]);

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
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Access Denied
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You don't have permission to access this page. Administrator privileges are required.
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Required Permissions:</p>
                    <ul className="space-y-1 text-left">
                      <li>• Administrator role</li>
                      {allowModerators && <li>• Moderator role (minimum)</li>}
                      <li>• Valid user account</li>
                      <li>• Account in good standing</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
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
