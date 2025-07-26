/**
 * Encrypted Chat Messages API
 * 
 * Handles encrypted message storage and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getFirestore, doc, setDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { z } from 'zod';

const db = getFirestore(app);

// Validation schemas
const EncryptedMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  encryptedContent: z.string().min(1, 'Encrypted content is required'),
  nonce: z.string().min(1, 'Nonce is required'),
  senderPublicKey: z.string().min(1, 'Sender public key is required'),
  threadId: z.string().optional(),
  messageType: z.enum(['text', 'file', 'image']).default('text'),
  metadata: z.object({
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional()
  }).optional()
});

const MessageQuerySchema = z.object({
  threadId: z.string().optional(),
  contactId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  before: z.string().optional() // Timestamp for pagination
});

/**
 * POST /api/chat/encrypted
 * Send an encrypted message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = EncryptedMessageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const {
      recipientId,
      encryptedContent,
      nonce,
      senderPublicKey,
      threadId,
      messageType,
      metadata
    } = validation.data;

    const senderId = session.user.uid;

    // Verify sender and recipient have valid public keys
    const [senderKeyDoc, recipientKeyDoc] = await Promise.all([
      getDocs(query(
        collection(db, 'userPublicKeys'),
        where('userId', '==', senderId),
        where('isActive', '==', true)
      )),
      getDocs(query(
        collection(db, 'userPublicKeys'),
        where('userId', '==', recipientId),
        where('isActive', '==', true)
      ))
    ]);

    if (senderKeyDoc.empty) {
      return NextResponse.json({
        error: 'Sender does not have active encryption keys'
      }, { status: 400 });
    }

    if (recipientKeyDoc.empty) {
      return NextResponse.json({
        error: 'Recipient does not have active encryption keys'
      }, { status: 400 });
    }

    // Verify the sender's public key matches their stored key
    const storedSenderKey = senderKeyDoc.docs[0].data().publicKey;
    if (storedSenderKey !== senderPublicKey) {
      return NextResponse.json({
        error: 'Invalid sender public key'
      }, { status: 400 });
    }

    // Generate message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create or find thread
    let finalThreadId = threadId;
    if (!finalThreadId) {
      // Generate thread ID based on participant IDs (deterministic)
      const participantIds = [senderId, recipientId].sort();
      finalThreadId = `thread_${participantIds.join('_')}`;
    }

    // Store encrypted message
    const encryptedMessageData = {
      messageId,
      threadId: finalThreadId,
      senderId,
      recipientId,
      encryptedContent,
      nonce,
      senderPublicKey,
      messageType,
      metadata: metadata || null,
      createdAt: serverTimestamp(),
      isRead: false,
      isEncrypted: true,
      encryptionVersion: 1
    };

    await addDoc(collection(db, 'encryptedMessages'), encryptedMessageData);

    // Update thread metadata
    const threadData = {
      threadId: finalThreadId,
      participants: [senderId, recipientId],
      lastMessageAt: serverTimestamp(),
      lastMessageType: messageType,
      isEncrypted: true,
      messageCount: 1, // This would need to be incremented properly
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'messageThreads', finalThreadId), threadData, { merge: true });

    // Log message sent for analytics (without content)
    await addDoc(collection(db, 'messageAuditLog'), {
      messageId,
      senderId,
      recipientId,
      threadId: finalThreadId,
      action: 'message_sent',
      messageType,
      isEncrypted: true,
      timestamp: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      messageId,
      threadId: finalThreadId,
      timestamp: new Date().toISOString(),
      message: 'Encrypted message sent successfully'
    });

  } catch (error: any) {
    console.error('Encrypted message send error:', error);
    
    return NextResponse.json({
      error: 'Failed to send encrypted message',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/chat/encrypted
 * Retrieve encrypted messages for a thread or contact
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const queryValidation = MessageQuerySchema.safeParse({
      threadId: searchParams.get('threadId'),
      contactId: searchParams.get('contactId'),
      limit: parseInt(searchParams.get('limit') || '50'),
      before: searchParams.get('before')
    });

    if (!queryValidation.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: queryValidation.error.errors
      }, { status: 400 });
    }

    const { threadId, contactId, limit: messageLimit, before } = queryValidation.data;
    const userId = session.user.uid;

    let messagesQuery;

    if (threadId) {
      // Query by thread ID
      messagesQuery = query(
        collection(db, 'encryptedMessages'),
        where('threadId', '==', threadId),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(messageLimit)
      );
    } else if (contactId) {
      // Query by contact ID (both directions)
      messagesQuery = query(
        collection(db, 'encryptedMessages'),
        where('participants', 'array-contains-any', [userId, contactId]),
        orderBy('createdAt', 'desc'),
        limit(messageLimit)
      );
    } else {
      return NextResponse.json({
        error: 'Either threadId or contactId is required'
      }, { status: 400 });
    }

    const messagesSnapshot = await getDocs(messagesQuery);
    
    const messages = messagesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
      }))
      .filter(msg => 
        // Ensure user is participant in the message
        msg.senderId === userId || msg.recipientId === userId
      );

    // Get thread information if we have messages
    let threadInfo = null;
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const threadDoc = await getDocs(query(
        collection(db, 'messageThreads'),
        where('threadId', '==', firstMessage.threadId)
      ));
      
      if (!threadDoc.empty) {
        threadInfo = {
          ...threadDoc.docs[0].data(),
          lastMessageAt: threadDoc.docs[0].data().lastMessageAt?.toDate?.()?.toISOString() || null
        };
      }
    }

    return NextResponse.json({
      success: true,
      messages,
      threadInfo,
      hasMore: messages.length === messageLimit,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Encrypted message retrieval error:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve encrypted messages',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/chat/encrypted
 * Mark encrypted messages as read
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageIds, threadId } = body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({
        error: 'messageIds array is required'
      }, { status: 400 });
    }

    const userId = session.user.uid;
    const updatePromises = [];

    // Update read status for each message
    for (const messageId of messageIds.slice(0, 50)) { // Limit to prevent abuse
      const messageQuery = query(
        collection(db, 'encryptedMessages'),
        where('messageId', '==', messageId),
        where('recipientId', '==', userId) // Only recipient can mark as read
      );

      const messageSnapshot = await getDocs(messageQuery);
      
      for (const messageDoc of messageSnapshot.docs) {
        updatePromises.push(
          setDoc(messageDoc.ref, {
            isRead: true,
            readAt: serverTimestamp()
          }, { merge: true })
        );
      }
    }

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedCount: updatePromises.length,
      message: 'Messages marked as read'
    });

  } catch (error: any) {
    console.error('Message read update error:', error);
    
    return NextResponse.json({
      error: 'Failed to update message read status',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}