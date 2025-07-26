/**
 * Public Key Exchange API
 * 
 * Handles secure exchange of public keys for E2E encryption setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { z } from 'zod';

const db = getFirestore(app);

// Validation schemas
const PublicKeySchema = z.object({
  publicKey: z.string().min(1, 'Public key is required'),
  keyVersion: z.number().min(1).default(1),
  algorithm: z.string().default('x25519-xsalsa20-poly1305')
});

const KeyExchangeRequestSchema = z.object({
  recipientUserId: z.string().min(1, 'Recipient user ID is required'),
  publicKey: z.string().min(1, 'Public key is required')
});

/**
 * POST /api/chat/keys
 * Store or update user's public key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = PublicKeySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { publicKey, keyVersion, algorithm } = validation.data;
    const userId = session.user.uid;

    // Store the public key in Firestore
    const keyData = {
      userId,
      publicKey,
      keyVersion,
      algorithm,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    await setDoc(doc(db, 'userPublicKeys', userId), keyData);

    // Log key update for security audit
    await setDoc(doc(collection(db, 'keyAuditLog')), {
      userId,
      action: 'key_updated',
      keyVersion,
      timestamp: serverTimestamp(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Public key stored successfully',
      keyId: userId,
      keyVersion
    });

  } catch (error: any) {
    console.error('Public key storage error:', error);
    
    return NextResponse.json({
      error: 'Failed to store public key',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/chat/keys
 * Retrieve public keys for specified users or all contacts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const userIds = searchParams.get('userIds')?.split(',') || [];
    const includeOwn = searchParams.get('includeOwn') === 'true';

    const keys: { [userId: string]: any } = {};

    // Add current user's key if requested
    if (includeOwn) {
      const ownKeyDoc = await getDoc(doc(db, 'userPublicKeys', session.user.uid));
      if (ownKeyDoc.exists()) {
        keys[session.user.uid] = {
          ...ownKeyDoc.data(),
          isOwn: true
        };
      }
    }

    // Fetch requested user keys
    if (userIds.length > 0) {
      // Limit to prevent abuse
      const limitedUserIds = userIds.slice(0, 50);
      
      for (const userId of limitedUserIds) {
        if (userId && userId !== session.user.uid) {
          const keyDoc = await getDoc(doc(db, 'userPublicKeys', userId));
          if (keyDoc.exists()) {
            const keyData = keyDoc.data();
            keys[userId] = {
              userId: keyData.userId,
              publicKey: keyData.publicKey,
              keyVersion: keyData.keyVersion,
              algorithm: keyData.algorithm,
              updatedAt: keyData.updatedAt,
              isActive: keyData.isActive
            };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      keys,
      count: Object.keys(keys).length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Public key retrieval error:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve public keys',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/chat/keys
 * Initiate key exchange with another user
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = KeyExchangeRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { recipientUserId, publicKey } = validation.data;
    const initiatorId = session.user.uid;

    // Verify recipient exists and has a public key
    const recipientKeyDoc = await getDoc(doc(db, 'userPublicKeys', recipientUserId));
    if (!recipientKeyDoc.exists()) {
      return NextResponse.json({
        error: 'Recipient does not have encryption enabled'
      }, { status: 400 });
    }

    // Create key exchange record
    const exchangeId = `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const keyExchangeData = {
      exchangeId,
      initiatorId,
      recipientId: recipientUserId,
      initiatorPublicKey: publicKey,
      recipientPublicKey: recipientKeyDoc.data().publicKey,
      status: 'initiated',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    await setDoc(doc(db, 'keyExchanges', exchangeId), keyExchangeData);

    // Log key exchange initiation
    await setDoc(doc(collection(db, 'keyAuditLog')), {
      userId: initiatorId,
      action: 'key_exchange_initiated',
      recipientId: recipientUserId,
      exchangeId,
      timestamp: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      exchangeId,
      recipientPublicKey: recipientKeyDoc.data().publicKey,
      message: 'Key exchange initiated successfully'
    });

  } catch (error: any) {
    console.error('Key exchange error:', error);
    
    return NextResponse.json({
      error: 'Key exchange failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/chat/keys
 * Revoke public key and disable encryption
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.uid;

    // Mark key as inactive instead of deleting for audit purposes
    await setDoc(doc(db, 'userPublicKeys', userId), {
      isActive: false,
      revokedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Log key revocation
    await setDoc(doc(collection(db, 'keyAuditLog')), {
      userId,
      action: 'key_revoked',
      timestamp: serverTimestamp(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Public key revoked successfully'
    });

  } catch (error: any) {
    console.error('Key revocation error:', error);
    
    return NextResponse.json({
      error: 'Failed to revoke public key',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}