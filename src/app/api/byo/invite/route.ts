import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, updateDoc, getDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getServerUser } from '@/lib/auth/getServerUser';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(app);

export interface ByoInvite {
  id: string;
  creatorId: string;
  clientEmail?: string;
  clientName?: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired' | 'used';
  createdAt: any;
  expiresAt: any;
  acceptedAt?: any;
  bookingId?: string; // Set when invite is used for booking
  notes?: string;
}

/**
 * BYO (Bring Your Own) Invite API
 * POST /api/byo/invite - Create invite link
 * GET /api/byo/invite?code=xyz - Validate invite
 * PUT /api/byo/invite - Update invite status
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user || user.role !== 'creator') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    const { clientEmail, clientName, notes, expiresInDays = 30 } = await request.json();

    // Generate unique invite
    const inviteId = uuidv4();
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const byoInvite: ByoInvite = {
      id: inviteId,
      creatorId: user.uid,
      clientEmail,
      clientName,
      inviteCode,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt,
      notes
    };

    // Save invite to database
    await setDoc(doc(db, 'byoInvites', inviteId), byoInvite);

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auditoryx.com';
    const inviteUrl = `${baseUrl}/invite/${inviteCode}`;

    // TODO: Send email notification to client if email provided
    if (clientEmail) {
      await sendInviteEmail(clientEmail, {
        creatorName: user.name || 'A creator',
        inviteUrl,
        notes
      });
    }

    return NextResponse.json({
      success: true,
      invite: {
        id: inviteId,
        code: inviteCode,
        url: inviteUrl,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating BYO invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const creatorId = searchParams.get('creatorId');

    if (code) {
      // Validate invite code
      return await validateInviteCode(code);
    } else if (creatorId) {
      // Get creator's invites (requires auth)
      const user = await getServerUser(request);
      if (!user || (user.uid !== creatorId && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return await getCreatorInvites(creatorId);
    } else {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing BYO invite request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { inviteId, status, bookingId } = await request.json();

    if (!inviteId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get invite
    const inviteDoc = await getDoc(doc(db, 'byoInvites', inviteId));
    if (!inviteDoc.exists()) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    const invite = inviteDoc.data() as ByoInvite;

    // Authorize update
    if (user.uid !== invite.creatorId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update invite
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'accepted') {
      updateData.acceptedAt = serverTimestamp();
    }

    if (bookingId) {
      updateData.bookingId = bookingId;
    }

    await updateDoc(doc(db, 'byoInvites', inviteId), updateData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating BYO invite:', error);
    return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 });
  }
}

/**
 * Validate invite code and return invite details
 */
async function validateInviteCode(code: string) {
  try {
    // Find invite by code
    const invitesQuery = query(
      collection(db, 'byoInvites'),
      where('inviteCode', '==', code),
      limit(1)
    );
    const snapshot = await getDocs(invitesQuery);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const inviteDoc = snapshot.docs[0];
    const invite = inviteDoc.data() as ByoInvite;

    // Check if expired
    const now = new Date();
    const expiresAt = invite.expiresAt?.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    
    if (now > expiresAt) {
      return NextResponse.json({ 
        error: 'Invite expired',
        invite: { ...invite, id: inviteDoc.id }
      }, { status: 410 });
    }

    // Check if already used
    if (invite.status === 'used') {
      return NextResponse.json({ 
        error: 'Invite already used',
        invite: { ...invite, id: inviteDoc.id }
      }, { status: 410 });
    }

    // Get creator info
    const creatorDoc = await getDoc(doc(db, 'users', invite.creatorId));
    const creator = creatorDoc.exists() ? creatorDoc.data() : null;

    return NextResponse.json({
      valid: true,
      invite: { ...invite, id: inviteDoc.id },
      creator: creator ? {
        uid: creator.uid,
        name: creator.name,
        bio: creator.bio,
        tier: creator.tier,
        profilePicture: creator.profilePicture
      } : null
    });

  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 });
  }
}

/**
 * Get all invites for a creator
 */
async function getCreatorInvites(creatorId: string) {
  try {
    const invitesQuery = query(
      collection(db, 'byoInvites'),
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(invitesQuery);

    const invites = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ invites });

  } catch (error) {
    console.error('Error getting creator invites:', error);
    return NextResponse.json({ error: 'Failed to get invites' }, { status: 500 });
  }
}

/**
 * Generate random invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Send invite email (placeholder)
 */
async function sendInviteEmail(email: string, data: {
  creatorName: string;
  inviteUrl: string;
  notes?: string;
}) {
  // TODO: Implement email sending
  console.log('Sending BYO invite email to:', email, data);
  
  // In production, you would use SendGrid, SES, or another email service
  // const emailService = getEmailService();
  // await emailService.send({
  //   to: email,
  //   template: 'byo-invite',
  //   data
  // });
}