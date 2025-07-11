import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { adminDb } from '@/lib/firebase-admin';
import { checkAdminAccess } from '@/lib/auth/withAdminCheck';
import { z } from 'zod';

const verifyUserSchema = z.object({
  verified: z.boolean(),
  reviewNotes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const adminCheck = checkAdminAccess(session.user.role as any, { allowModerators: true });
    if (!adminCheck.hasAccess) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Admin access required.' 
      }, { status: 403 });
    }

    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = verifyUserSchema.parse(body);

    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    // Update user verification status
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      verified: validatedData.verified,
      verificationUpdatedAt: new Date(),
      verificationUpdatedBy: session.user.id,
    };

    if (validatedData.reviewNotes) {
      updateData.verificationNotes = validatedData.reviewNotes;
    }

    await userRef.update(updateData);

    // If there's a verification application, update it too
    try {
      const applicationRef = adminDb.collection('verificationApplications')
        .where('userId', '==', uid)
        .where('status', '==', 'pending')
        .limit(1);
      
      const applicationDocs = await applicationRef.get();
      
      if (!applicationDocs.empty) {
        const applicationDoc = applicationDocs.docs[0];
        await applicationDoc.ref.update({
          status: validatedData.verified ? 'approved' : 'rejected',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: validatedData.reviewNotes || '',
        });
      }
    } catch (error) {
      console.warn('Could not update verification application:', error);
      // Don't fail the main request if application update fails
    }

    // Get updated user data
    const updatedUserDoc = await userRef.get();
    const updatedUser = updatedUserDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: uid,
        verified: updatedUser?.verified || false,
        verificationUpdatedAt: updatedUser?.verificationUpdatedAt,
        verificationUpdatedBy: updatedUser?.verificationUpdatedBy,
      },
      message: validatedData.verified ? 'User verified successfully' : 'User verification removed'
    });

  } catch (error) {
    console.error('Error updating user verification:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to update user verification' 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access for GET as well
    const adminCheck = checkAdminAccess(session.user.role as any, { allowModerators: true });
    if (!adminCheck.hasAccess) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Admin access required.' 
      }, { status: 403 });
    }

    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    return NextResponse.json({
      uid: uid,
      verified: userData?.verified || false,
      verificationUpdatedAt: userData?.verificationUpdatedAt,
      verificationUpdatedBy: userData?.verificationUpdatedBy,
      verificationNotes: userData?.verificationNotes,
    });

  } catch (error) {
    console.error('Error fetching user verification status:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user verification status' 
    }, { status: 500 });
  }
}