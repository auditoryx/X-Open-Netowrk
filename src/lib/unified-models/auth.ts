import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { admin } from '@/lib/firebase-admin';
import { UnifiedUser, validateUnifiedUser, isAdmin, isCreator } from './user';

/**
 * Unified Authentication Module
 * 
 * Consolidates authentication logic from multiple sources:
 * - Next-Auth sessions
 * - Firebase Admin SDK
 * - Custom JWT validation
 * 
 * Provides a single interface for user authentication and authorization
 */

export interface AuthContext {
  user: UnifiedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  hasPermission: (permission: string) => boolean;
}

export interface SessionUser {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  tier?: string;
}

/**
 * Get authenticated user from Next-Auth session
 */
export async function getSessionUser(request?: NextRequest): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    return {
      uid: session.user.id || '',
      email: session.user.email,
      name: session.user.name || undefined,
      role: (session.user as any).role,
      tier: (session.user as any).tier,
    };
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
 * Get full user data from Firestore by UID
 */
export async function getUserByUid(uid: string): Promise<UnifiedUser | null> {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    if (!userData) {
      return null;
    }

    // Convert Firestore timestamps to Date objects
    const processedData = {
      ...userData,
      uid,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
      lastSignIn: userData.lastSignIn?.toDate(),
      verifiedAt: userData.verifiedAt?.toDate(),
      migratedAt: userData.migratedAt?.toDate(),
      deletedAt: userData.deletedAt?.toDate(),
    };

    return validateUnifiedUser(processedData);
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
}

/**
 * Get full authenticated user context
 */
export async function getAuthContext(request?: NextRequest): Promise<AuthContext> {
  const sessionUser = await getSessionUser(request);
  
  if (!sessionUser) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isCreator: false,
      hasPermission: () => false,
    };
  }

  const user = await getUserByUid(sessionUser.uid);
  
  if (!user) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isCreator: false,
      hasPermission: () => false,
    };
  }

  return {
    user,
    isAuthenticated: true,
    isAdmin: isAdmin(user),
    isCreator: isCreator(user),
    hasPermission: (permission: string) => hasPermission(user, permission),
  };
}

/**
 * Require authentication for API routes
 */
export async function requireAuth(request?: NextRequest): Promise<UnifiedUser> {
  const context = await getAuthContext(request);
  
  if (!context.isAuthenticated || !context.user) {
    throw new Error('Authentication required');
  }
  
  return context.user;
}

/**
 * Require admin role for API routes
 */
export async function requireAdmin(request?: NextRequest): Promise<UnifiedUser> {
  const user = await requireAuth(request);
  
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Require creator role for API routes
 */
export async function requireCreator(request?: NextRequest): Promise<UnifiedUser> {
  const user = await requireAuth(request);
  
  if (!isCreator(user)) {
    throw new Error('Creator access required');
  }
  
  return user;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: UnifiedUser, permission: string): boolean {
  // Admin users have all permissions
  if (isAdmin(user)) {
    return true;
  }

  // Permission mapping based on role and tier
  const permissions: Record<string, string[]> = {
    'user.profile.view': ['client', 'creator', 'admin'],
    'user.profile.edit': ['client', 'creator', 'admin'],
    'user.verification.submit': ['client', 'creator'],
    'user.verification.approve': ['admin'],
    'service.create': ['creator', 'artist', 'producer', 'engineer', 'studio', 'videographer'],
    'service.edit': ['creator', 'artist', 'producer', 'engineer', 'studio', 'videographer'],
    'booking.create': ['client', 'creator'],
    'booking.manage': ['creator', 'admin'],
    'payment.process': ['client', 'creator'],
    'review.submit': ['client', 'creator'],
    'review.moderate': ['admin', 'moderator'],
    'analytics.view': ['admin'],
    'user.ban': ['admin'],
    'user.promote': ['admin'],
  };

  const allowedRoles = permissions[permission];
  if (!allowedRoles) {
    return false;
  }

  // Check if user's role is in allowed roles
  if (!allowedRoles.includes(user.role)) {
    return false;
  }

  // Additional tier-based restrictions
  if (permission.startsWith('service.') && user.tier === 'standard') {
    return false; // Standard users cannot provide services
  }

  return true;
}

/**
 * Create user session data for Next-Auth
 */
export function createSessionData(user: UnifiedUser) {
  return {
    user: {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.name,
      image: user.profilePicture,
      role: user.role,
      tier: user.tier,
      verificationStatus: user.verificationStatus,
    },
  };
}

/**
 * Validate Firebase ID token
 */
export async function validateFirebaseToken(idToken: string): Promise<UnifiedUser | null> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await getUserByUid(decodedToken.uid);
    return user;
  } catch (error) {
    console.error('Error validating Firebase token:', error);
    return null;
  }
}

/**
 * Check if user owns resource
 */
export function isResourceOwner(user: UnifiedUser, resourceUserId: string): boolean {
  return user.uid === resourceUserId;
}

/**
 * Get authorization header from request
 */
export function getAuthHeader(request: NextRequest): string | null {
  return request.headers.get('authorization');
}

/**
 * Extract Bearer token from authorization header
 */
export function extractBearerToken(authHeader: string): string | null {
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware-style authentication check
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  user: UnifiedUser;
  error?: never;
} | {
  user?: never;
  error: { message: string; status: number };
}> {
  try {
    // Try session-based auth first
    const user = await requireAuth(request);
    return { user };
  } catch (sessionError) {
    // Try token-based auth as fallback
    const authHeader = getAuthHeader(request);
    if (!authHeader) {
      return {
        error: {
          message: 'Authentication required',
          status: 401,
        },
      };
    }

    const token = extractBearerToken(authHeader);
    if (!token) {
      return {
        error: {
          message: 'Invalid authorization header format',
          status: 401,
        },
      };
    }

    const user = await validateFirebaseToken(token);
    if (!user) {
      return {
        error: {
          message: 'Invalid or expired token',
          status: 401,
        },
      };
    }

    return { user };
  }
}