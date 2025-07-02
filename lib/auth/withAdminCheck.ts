/**
 * Admin Protection Utility
 * 
 * This utility provides comprehensive admin access control for both
 * client-side components and API routes. It ensures only users with
 * admin privileges can access protected resources.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface AdminUser {
  uid: string;
  email?: string;
  role?: string;
  admin?: boolean;
  customClaims?: Record<string, any>;
}

export interface AdminCheckResult {
  isAdmin: boolean;
  user?: AdminUser;
  error?: string;
}

/**
 * Verify admin access using Firebase Admin SDK (server-side)
 * @param token - Firebase ID token
 * @returns Promise<AdminCheckResult>
 */
export async function verifyAdminToken(token: string): Promise<AdminCheckResult> {
  try {
    if (!token) {
      return { isAdmin: false, error: 'No token provided' };
    }

    // Verify the token using Firebase Admin
    const decodedToken = await getAuth(admin).verifyIdToken(token);
    
    // Check custom claims for admin status
    const isAdminFromClaims = decodedToken.admin === true || decodedToken.role === 'admin';
    
    // Double-check with Firestore user document
    let isAdminFromFirestore = false;
    try {
      const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
      const userData = userDoc.data();
      isAdminFromFirestore = userData?.role === 'admin' || userData?.admin === true;
    } catch (firestoreError) {
      console.warn('Could not verify admin status from Firestore:', firestoreError);
    }

    const isAdmin = isAdminFromClaims || isAdminFromFirestore;

    return {
      isAdmin,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        admin: isAdmin,
        customClaims: decodedToken
      }
    };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return { 
      isAdmin: false, 
      error: error instanceof Error ? error.message : 'Token verification failed' 
    };
  }
}

/**
 * Higher-Order Function for API route admin protection
 * @param handler - API route handler function
 * @returns Protected API route handler
 */
export function withAdminCheck<T extends NextRequest>(
  handler: (req: T & { admin: AdminUser }, res?: NextResponse) => Promise<NextResponse> | NextResponse
) {
  return async (req: T, res?: NextResponse): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '') || 
                   req.cookies.get('session')?.value ||
                   req.nextUrl.searchParams.get('token');

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized: No authentication token provided' },
          { status: 401 }
        );
      }

      // Verify admin access
      const { isAdmin, user, error } = await verifyAdminToken(token);

      if (!isAdmin) {
        return NextResponse.json(
          { 
            error: 'Forbidden: Admin access required',
            details: error || 'Insufficient privileges'
          },
          { status: 403 }
        );
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid user data' },
          { status: 401 }
        );
      }

      // Add admin user to request object
      (req as any).admin = user;

      // Call the protected handler
      return await handler(req as T & { admin: AdminUser }, res);

    } catch (error) {
      console.error('Admin check middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error during admin verification' },
        { status: 500 }
      );
    }
  };
}

/**
 * Client-side admin check utility
 * @param user - Current user object from useAuth
 * @returns boolean indicating admin status
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false;
  
  // Check custom claims
  if (user.admin === true || user.customClaims?.admin === true) {
    return true;
  }
  
  // Check role
  if (user.role === 'admin' || user.customClaims?.role === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Check if user has moderator or higher privileges
 * @param user - Current user object
 * @returns boolean indicating moderator+ status
 */
export function isUserModerator(user: any): boolean {
  if (!user) return false;
  
  // Admin users are also moderators
  if (isUserAdmin(user)) return true;
  
  // Check for moderator role
  const role = user.role || user.customClaims?.role;
  return role === 'moderator';
}

/**
 * Check if user can access admin features
 * @param user - Current user object
 * @returns AdminCheckResult with detailed access info
 */
export function checkAdminAccess(user: any): AdminCheckResult {
  if (!user) {
    return { isAdmin: false, error: 'User not authenticated' };
  }

  const isAdmin = isUserAdmin(user);
  const isModerator = isUserModerator(user);

  return {
    isAdmin: isAdmin || isModerator,
    user: {
      uid: user.uid,
      email: user.email,
      role: user.role || user.customClaims?.role || 'user',
      admin: isAdmin,
      customClaims: user.customClaims
    }
  };
}

/**
 * Get admin-accessible routes list
 * @returns Array of admin-only route patterns
 */
export function getAdminRoutes(): string[] {
  return [
    '/admin',
    '/admin/*',
    '/dashboard/admin',
    '/dashboard/admin/*',
    '/api/admin/*',
    '/api/ban-user',
    '/api/assign-role',
    '/api/set-role',
    '/api/promote-user',
    '/admin/users',
    '/admin/verifications',
    '/admin/disputes',
    '/admin/reports',
    '/admin/earnings',
    '/dashboard/admin/earnings',
    '/dashboard/admin/verifications',
    '/dashboard/admin/disputes'
  ];
}

/**
 * Check if a route requires admin access
 * @param pathname - Route pathname to check
 * @returns boolean indicating if route is admin-only
 */
export function isAdminRoute(pathname: string): boolean {
  const adminRoutes = getAdminRoutes();
  
  return adminRoutes.some(route => {
    if (route.endsWith('/*')) {
      const basePath = route.slice(0, -2);
      return pathname.startsWith(basePath);
    }
    return pathname === route;
  });
}

export default withAdminCheck;
