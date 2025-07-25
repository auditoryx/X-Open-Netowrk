import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { 
  UnifiedUser, 
  UpdateUser,
  VerificationUpdate,
  validateUpdateUser,
  validateVerificationUpdate,
  toPublicUser,
  toPrivateUser 
} from '@/lib/unified-models/user';
import { 
  getAuthContext, 
  requireAuth, 
  requireAdmin,
  isResourceOwner 
} from '@/lib/unified-models/auth';

/**
 * Individual User API
 * 
 * Handles CRUD operations for specific users using the unified user model
 */

// GET /api/users/[uid] - Get user by ID
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const authContext = await getAuthContext(request);

    // Fetch user data
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Convert Firestore timestamps to Date objects
    const user: UnifiedUser = {
      ...userData,
      uid,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
      lastSignIn: userData.lastSignIn?.toDate(),
      verifiedAt: userData.verifiedAt?.toDate(),
      migratedAt: userData.migratedAt?.toDate(),
      deletedAt: userData.deletedAt?.toDate(),
    } as UnifiedUser;

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return appropriate data based on permissions
    let responseUser;
    if (!authContext.isAuthenticated) {
      // Public view - minimal data
      responseUser = toPublicUser(user);
    } else if (authContext.isAdmin || isResourceOwner(authContext.user!, uid)) {
      // Admin or owner - full data
      responseUser = user;
    } else {
      // Authenticated user - private data (no sensitive fields)
      responseUser = toPrivateUser(user);
    }

    return NextResponse.json(responseUser);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[uid] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const body = await request.json();
    const authContext = await getAuthContext(request);

    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions - users can only update their own profile, admins can update any
    if (!authContext.isAdmin && !isResourceOwner(authContext.user!, uid)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate update data
    const updateData = validateUpdateUser(body);

    // Special handling for verification updates (admin only)
    if ('verificationStatus' in updateData && !authContext.isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update verification status' },
        { status: 403 }
      );
    }

    // Check if user exists
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data for Firestore
    const firestoreUpdate: any = {
      ...updateData,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    // Convert Date fields to Firestore Timestamps
    if (updateData.lastSignIn) {
      firestoreUpdate.lastSignIn = admin.firestore.Timestamp.fromDate(updateData.lastSignIn);
    }
    if (updateData.verifiedAt) {
      firestoreUpdate.verifiedAt = admin.firestore.Timestamp.fromDate(updateData.verifiedAt);
    }

    // Update user
    await userRef.update(firestoreUpdate);

    // Fetch updated user data
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    const updatedUser: UnifiedUser = {
      ...updatedData,
      uid,
      createdAt: updatedData!.createdAt?.toDate() || new Date(),
      updatedAt: updatedData!.updatedAt?.toDate() || new Date(),
      lastSignIn: updatedData!.lastSignIn?.toDate(),
      verifiedAt: updatedData!.verifiedAt?.toDate(),
      migratedAt: updatedData!.migratedAt?.toDate(),
      deletedAt: updatedData!.deletedAt?.toDate(),
    } as UnifiedUser;

    // Return appropriate data based on permissions
    const responseUser = authContext.isAdmin || isResourceOwner(authContext.user!, uid)
      ? updatedUser
      : toPrivateUser(updatedUser);

    return NextResponse.json(responseUser);

  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[uid] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const authContext = await getAuthContext(request);

    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions - users can delete their own account, admins can delete any
    if (!authContext.isAdmin && !isResourceOwner(authContext.user!, uid)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if user exists
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete - set isActive to false and add deletedAt timestamp
    await userRef.update({
      isActive: false,
      deletedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return NextResponse.json({ 
      message: 'User deleted successfully',
      uid,
      deletedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
