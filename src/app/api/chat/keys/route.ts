/**
 * Key Exchange API for E2E Chat
 * 
 * Handles public key exchange and session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { keyExchange, initializeChatEncryption } from '@/lib/encryption/key-exchange';
import { z } from 'zod';

const InitializeKeysSchema = z.object({
  userId: z.string().optional(), // If not provided, use session user
});

const GetPublicKeySchema = z.object({
  userId: z.string(),
});

const EstablishSessionSchema = z.object({
  bookingId: z.string(),
  participantId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'initialize': {
        const { userId } = InitializeKeysSchema.parse(body);
        const targetUserId = userId || session.user.uid as string;
        
        // Verify user can initialize keys for this user ID
        if (targetUserId !== session.user.uid && !session.user.isAdmin) {
          return NextResponse.json({ error: 'Cannot initialize keys for other users' }, { status: 403 });
        }

        const success = await initializeChatEncryption(targetUserId);
        
        if (success) {
          const userKey = await keyExchange.initializeUserKeys(targetUserId);
          return NextResponse.json({
            success: true,
            publicKey: userKey.publicKey,
            keyId: userKey.keyId,
            createdAt: userKey.createdAt,
          });
        } else {
          return NextResponse.json({ error: 'Failed to initialize encryption' }, { status: 500 });
        }
      }

      case 'establishSession': {
        const { bookingId, participantId } = EstablishSessionSchema.parse(body);
        const userId = session.user.uid as string;

        // Create encryption session between two users
        const chatSession = await keyExchange.getSessionForBooking(bookingId, userId, participantId);
        
        return NextResponse.json({
          success: true,
          sessionId: chatSession.sessionId,
          status: chatSession.status,
          participants: chatSession.participants,
          createdAt: chatSession.createdAt,
          expiresAt: chatSession.expiresAt,
        });
      }

      case 'rotateKeys': {
        const userId = session.user.uid as string;
        
        const newKeyData = await keyExchange.rotateUserKeys(userId);
        
        return NextResponse.json({
          success: true,
          publicKey: newKeyData.publicKey,
          keyId: newKeyData.keyId,
          createdAt: newKeyData.createdAt,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Key exchange API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getPublicKey': {
        const { userId } = GetPublicKeySchema.parse({
          userId: searchParams.get('userId'),
        });

        const publicKey = await keyExchange.getUserPublicKey(userId);
        
        if (publicKey) {
          return NextResponse.json({
            success: true,
            publicKey,
            userId,
          });
        } else {
          return NextResponse.json({ error: 'Public key not found' }, { status: 404 });
        }
      }

      case 'getMyKeys': {
        const userId = session.user.uid as string;
        
        try {
          const userKey = await keyExchange.initializeUserKeys(userId);
          return NextResponse.json({
            success: true,
            publicKey: userKey.publicKey,
            keyId: userKey.keyId,
            createdAt: userKey.createdAt,
            lastUsed: userKey.lastUsed,
            isActive: userKey.isActive,
          });
        } catch (error) {
          return NextResponse.json({ error: 'Failed to retrieve keys' }, { status: 500 });
        }
      }

      case 'checkEncryptionSupport': {
        // This endpoint helps clients check if encryption is supported
        return NextResponse.json({
          success: true,
          encryptionSupported: true,
          algorithm: 'ECDH-P256-AES-GCM',
          keyRotationEnabled: true,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Key exchange GET API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}