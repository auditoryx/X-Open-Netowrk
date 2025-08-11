import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { 
  UnifiedUser, 
  CreateUser, 
  UpdateUser,
  validateCreateUser, 
  validateUpdateUser,
  toPublicUser,
  toPrivateUser 
} from '@/lib/unified-models/user';
import { 
  getAuthContext, 
  requireAuth, 
  requireAdmin,
  hasPermission 
} from '@/lib/unified-models/auth';

/**
 * Unified Users API
 * 
 * Replaces multiple user-related endpoints with a single, comprehensive API
 * Handles CRUD operations for the unified user model
 */

// GET /api/users - List users (admin only) or search users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const tier = searchParams.get('tier');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const publicOnly = searchParams.get('public') === 'true';

    const authContext = await getAuthContext(request);
    
    // If not authenticated and not requesting public data, return error
    if (!authContext.isAuthenticated && !publicOnly) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build Firestore query
    let query = admin.firestore().collection('users').where('isActive', '==', true);

    // Apply filters
    if (role) {
      query = query.where('role', '==', role);
    }
    if (tier) {
      query = query.where('tier', '==', tier);
    }

    // Apply search (simplified - in production use search service)
    if (search) {
      // This is a basic implementation - should use Algolia/Typesense
      query = query.where('displayName', '>=', search)
                  .where('displayName', '<=', search + '\uf8ff');
    }

    // Apply pagination
    query = query.offset(offset).limit(limit);

    const snapshot = await query.get();
    const users: Array<Partial<UnifiedUser>> = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const user = {
        ...userData,
        uid: doc.id,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
        lastSignIn: userData.lastSignIn?.toDate(),
        verifiedAt: userData.verifiedAt?.toDate(),
        migratedAt: userData.migratedAt?.toDate(),
        deletedAt: userData.deletedAt?.toDate(),
      } as UnifiedUser;

      // Return appropriate user data based on permissions
      if (publicOnly || !authContext.isAuthenticated) {
        users.push(toPublicUser(user));
      } else if (authContext.isAdmin || user.uid === authContext.user?.uid) {
        users.push(user); // Full data for admin or own profile
      } else {
        users.push(toPrivateUser(user)); // Private data for authenticated users
      }
    }

    return NextResponse.json({
      users,
      pagination: {
        offset,
        limit,
        total: users.length,
        hasMore: users.length === limit,
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only or self-registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const createUserData = validateCreateUser(body);
    
    const authContext = await getAuthContext(request);
    
    // Check if user can create accounts
    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can create accounts for others, users can only create their own
    if (!authContext.isAdmin && body.uid !== authContext.user?.uid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const now = new Date();
    const uid = body.uid || authContext.user?.uid;
    
    if (!uid) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await admin.firestore().collection('users').doc(uid).get();
    if (existingUser.exists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser: Omit<UnifiedUser, 'uid'> = {
      email: createUserData.email,
      displayName: createUserData.displayName,
      role: createUserData.role,
      tier: 'standard',
      verificationStatus: 'unverified',
      xp: 0,
      rankScore: 0,
      reviewCount: 0,
      emailVerified: false,
      paymentMethodsSetup: false,
      isActive: true,
      bio: createUserData.bio,
      location: createUserData.location,
      website: createUserData.website,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      profileVisibility: 'public',
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.set({
      ...newUser,
      createdAt: admin.firestore.Timestamp.fromDate(newUser.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(newUser.updatedAt),
    });

    // Return the created user (without sensitive data)
    const responseUser = authContext.isAdmin 
      ? { ...newUser, uid }
      : toPrivateUser({ ...newUser, uid });

    return NextResponse.json(responseUser, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Bulk update users (admin only)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { users: userUpdates } = body;
    
    if (!Array.isArray(userUpdates)) {
      return NextResponse.json(
        { error: 'Expected array of user updates' },
        { status: 400 }
      );
    }

    const batch = admin.firestore().batch();
    const results: Array<{ uid: string; success: boolean; error?: string }> = [];

    for (const update of userUpdates) {
      try {
        const { uid, ...updateData } = update;
        
        if (!uid) {
          results.push({ uid: 'unknown', success: false, error: 'Missing uid' });
          continue;
        }

        const validatedUpdate = validateUpdateUser(updateData);
        const userRef = admin.firestore().collection('users').doc(uid);
        
        batch.update(userRef, {
          ...validatedUpdate,
          updatedAt: admin.firestore.Timestamp.now(),
        });

        results.push({ uid, success: true });
      } catch (error) {
        results.push({
          uid: update.uid || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      message: 'Bulk update completed',
      results,
      summary: {
        total: userUpdates.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Bulk soft delete users (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const uids = searchParams.get('uids')?.split(',') || [];
    
    if (uids.length === 0) {
      return NextResponse.json(
        { error: 'No user IDs provided' },
        { status: 400 }
      );
    }

    const batch = admin.firestore().batch();
    const results: Array<{ uid: string; success: boolean; error?: string }> = [];

    for (const uid of uids) {
      try {
        const userRef = admin.firestore().collection('users').doc(uid);
        
        // Soft delete by setting isActive to false and deletedAt timestamp
        batch.update(userRef, {
          isActive: false,
          deletedAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        results.push({ uid, success: true });
      } catch (error) {
        results.push({
          uid,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      message: 'Bulk delete completed',
      results,
      summary: {
        total: uids.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk delete' },
      { status: 500 }
    );
  }
}