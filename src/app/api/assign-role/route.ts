import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { withAdminCheck } from '@/lib/auth/withAdminCheck';
import { logger } from '@lib/logger';
import { AssignRoleSchema, validateAssignRole } from '@/lib/schema';

async function handler(req: NextRequest & { admin: any }) {
  const body = await req.json();
  const parsed = AssignRoleSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { uid, role } = parsed.data;

  try {
    // Set custom claims
    await getAuth(admin).setCustomUserClaims(uid, { role });
    
    // Also update Firestore document for consistency
    await admin.firestore().collection('users').doc(uid).update({
      role,
      roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleUpdatedBy: req.admin.uid
    });
    
    logger.info(`Role assigned: ${role} to user ${uid} by admin ${req.admin.uid}`);
    
    return NextResponse.json({ 
      success: true,
      message: `Role ${role} assigned successfully`
    });
  } catch (error: any) {
    logger.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Role assignment failed', details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAdminCheck(handler);
