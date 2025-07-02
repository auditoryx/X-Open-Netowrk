import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminCheck } from '@/lib/auth/withAdminCheck';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const schema = z.object({
  uid: z.string().min(1),
  banned: z.boolean(),
  banReason: z.string().optional(),
  banExpiresAt: z.string().optional(),
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

  const { uid, banned, banReason, banExpiresAt } = parsed.data;

  try {
    const updateData: any = { 
      banned,
      bannedAt: banned ? new Date().toISOString() : null,
      bannedBy: req.admin.uid
    };

    if (banned) {
      if (banReason) updateData.banReason = banReason;
      if (banExpiresAt) updateData.banExpiresAt = banExpiresAt;
    } else {
      // Clear ban fields when unbanning
      updateData.banReason = null;
      updateData.banExpiresAt = null;
      updateData.unbannedAt = new Date().toISOString();
    }

    await updateDoc(doc(db, 'users', uid), updateData);
    
    return NextResponse.json({ 
      success: true,
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`
    });
  } catch (err: any) {
    console.error('Error updating ban status:', err);
    return NextResponse.json(
      { error: 'Failed to update ban status', details: err.message },
      { status: 500 }
    );
  }
}

export const POST = withAdminCheck(handler);
