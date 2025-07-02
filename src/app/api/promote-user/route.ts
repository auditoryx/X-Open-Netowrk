import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminCheck } from '@/lib/auth/withAdminCheck';
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
    await updateDoc(doc(db, 'users', uid), { 
      role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: req.admin.uid
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
