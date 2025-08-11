/**
 * Chat API with End-to-End Encryption
 * 
 * Handles encrypted message storage and key exchange
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { encryptChatMessage } from '@/lib/encryption/e2e-chat';
import { getChatEncryptionContext } from '@/lib/encryption/key-exchange';

// Message schema for validation
const SendEncryptedMessageSchema = z.object({
  bookingId: z.string(),
  recipientId: z.string(),
  message: z.string().min(1).max(2000),
  isEncrypted: z.boolean().default(true),
});

const GetMessagesSchema = z.object({
  bookingId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  before: z.string().optional(), // timestamp for pagination
});

interface EncryptedChatMessage {
  id?: string;
  bookingId: string;
  senderId: string;
  recipientId: string;
  encryptedContent: string; // Encrypted message content
  isEncrypted: boolean;
  timestamp: any;
  messageType: 'text' | 'system';
  sessionId?: string;
  seen: boolean;
  senderName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, recipientId, message, isEncrypted } = SendEncryptedMessageSchema.parse(body);
    
    const senderId = session.user.uid as string;

    // Verify booking exists and user has access
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingSnap.data();
    
    // Check if user is either client or provider
    if (senderId !== booking.clientUid && senderId !== booking.providerUid) {
      return NextResponse.json({ error: 'Unauthorized: You are not part of this booking' }, { status: 403 });
    }

    // Verify recipient is the other party in the booking
    const expectedRecipientId = senderId === booking.clientUid ? booking.providerUid : booking.clientUid;
    if (recipientId !== expectedRecipientId) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }

    let encryptedContent: string;
    let encryptionSessionId: string | undefined;

    if (isEncrypted) {
      // Get encryption context for this conversation
      const encryptionContext = await getChatEncryptionContext(bookingId, senderId, recipientId);
      
      if (!encryptionContext) {
        return NextResponse.json({ error: 'Failed to establish encryption' }, { status: 500 });
      }

      // Encrypt the message
      try {
        encryptedContent = await encryptChatMessage(
          message,
          encryptionContext.recipientPublicKey,
          encryptionContext.senderPrivateKey
        );
        encryptionSessionId = encryptionContext.session.sessionId;
      } catch (error) {
        console.error('Encryption failed:', error);
        return NextResponse.json({ error: 'Message encryption failed' }, { status: 500 });
      }
    } else {
      // Store message unencrypted (for system messages or fallback)
      encryptedContent = message;
    }

    // Store encrypted message in Firestore
    const chatMessage: EncryptedChatMessage = {
      bookingId,
      senderId,
      recipientId,
      encryptedContent,
      isEncrypted,
      timestamp: serverTimestamp(),
      messageType: SCHEMA_FIELDS.REVIEW.TEXT,
      sessionId: encryptionSessionId,
      seen: false,
      senderName: session.user.name || session.user.email || 'User',
    };

    const messagesRef = collection(db, 'encryptedChatMessages');
    const docRef = await addDoc(messagesRef, chatMessage);

    // Send notification to recipient (implement separately)
    // await sendChatNotification(recipientId, senderId, bookingId);

    return NextResponse.json({
      success: true,
      messageId: docRef.id,
      encrypted: isEncrypted,
      sessionId: encryptionSessionId,
    });

  } catch (error) {
    console.error('Send encrypted message error:', error);
    
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
    const { bookingId, limit, before } = GetMessagesSchema.parse({
      bookingId: searchParams.get(SCHEMA_FIELDS.REVIEW.BOOKING_ID),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      before: searchParams.get('before') || undefined,
    });

    const userId = session.user.uid as string;

    // Verify booking access
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingSnap.data();
    
    if (userId !== booking.clientUid && userId !== booking.providerUid) {
      return NextResponse.json({ error: 'Unauthorized: You are not part of this booking' }, { status: 403 });
    }

    // Build query for encrypted messages
    const messagesRef = collection(db, 'encryptedChatMessages');
    let q = query(
      messagesRef,
      where(SCHEMA_FIELDS.REVIEW.BOOKING_ID, '==', bookingId),
      orderBy('timestamp', 'desc')
    );

    // Add pagination if before timestamp provided
    if (before) {
      const beforeDate = new Date(before);
      q = query(q, where('timestamp', '<', beforeDate));
    }

    const messagesSnapshot = await getDocs(q);
    const messages: EncryptedChatMessage[] = [];

    messagesSnapshot.forEach((doc) => {
      const data = doc.data() as EncryptedChatMessage;
      messages.push({
        ...data,
        id: doc.id,
      });
    });

    // Return messages (client will handle decryption)
    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
      nextBefore: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    });

  } catch (error) {
    console.error('Get encrypted messages error:', error);
    
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