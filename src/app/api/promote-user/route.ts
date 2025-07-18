import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminCheck } from '@/lib/auth/withAdminCheck';
import { logAdminActivity } from '@/lib/firestore/logging/logAdminActivity';
import { z } from 'zod';

const schema = z.object({
  uid: z.string().min(1),
  role: z.enum(['user', 'artist', 'producer', 'engineer', 'studio', 'videographer', 'admin', 'moderator']),
});

async function handler(req: NextRequest & { admin: any }) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { uid, role } = parsed.data;

  try {
    // Get current user data for logging
    const userDoc = await getDoc(doc(db, 'users', uid));
    const currentRole = userDoc.exists() ? userDoc.data().role : 'unknown';

    await updateDoc(doc(db, 'users', uid), { 
      role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: req.admin.uid
    });
    
    // Log admin activity for audit trail
    await logAdminActivity(req.admin.uid, 'promote_user', {
      targetUserId: uid,
      previousValue: { role: currentRole },
      newValue: { role },
      reason: `Role change from ${currentRole} to ${role}`,
    });
    
    return NextResponse.json({ 
      success: true,
      message: `User promoted to ${role}`
    });
  } catch (error: any) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      { error: 'Failed to promote user', details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAdminCheck(handler);
