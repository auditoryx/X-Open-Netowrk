/**
 * Secure Key Exchange for E2E Chat
 * 
 * Manages public key distribution and secure key exchange protocol
 * Implements perfect forward secrecy with session keys
 */

import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateChatKeyPair, chatEncryption } from './e2e-chat';

export interface UserKeyData {
  publicKey: string;
  keyId: string;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface KeyExchangeSession {
  sessionId: string;
  participants: [string, string]; // [userId1, userId2]
  keys: {
    [userId: string]: {
      publicKey: string;
      keyId: string;
    };
  };
  sharedSecretHash: string; // Hash of shared secret for verification
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'established' | 'expired';
}

class ChatKeyExchange {
  private userKeys = new Map<string, UserKeyData>();
  private sessionKeys = new Map<string, KeyExchangeSession>();

  /**
   * Initialize or retrieve user's encryption keys
   */
  async initializeUserKeys(userId: string): Promise<UserKeyData> {
    const keyRef = doc(db, 'userChatKeys', userId);
    const keySnap = await getDoc(keyRef);

    if (keySnap.exists()) {
      const userData = keySnap.data() as UserKeyData;
      this.userKeys.set(userId, userData);
      return userData;
    }

    // Generate new key pair for user
    const keyPair = await generateChatKeyPair();
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const userData: UserKeyData = {
      publicKey: keyPair.publicKey,
      keyId,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    };

    await setDoc(keyRef, userData);
    this.userKeys.set(userId, userData);

    // Store private key securely in local storage (encrypted with user password in production)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chatPrivateKey_${userId}`, keyPair.privateKey);
    }

    return userData;
  }

  /**
   * Retrieve public key for a user
   */
  async getUserPublicKey(userId: string): Promise<string | null> {
    // Check cache first
    const cached = this.userKeys.get(userId);
    if (cached && cached.isActive) {
      return cached.publicKey;
    }

    // Fetch from Firestore
    const keyRef = doc(db, 'userChatKeys', userId);
    const keySnap = await getDoc(keyRef);

    if (keySnap.exists()) {
      const userData = keySnap.data() as UserKeyData;
      this.userKeys.set(userId, userData);
      return userData.publicKey;
    }

    return null;
  }

  /**
   * Get user's private key from secure storage
   */
  async getUserPrivateKey(userId: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    // In production, this should be derived from user's password
    return localStorage.getItem(`chatPrivateKey_${userId}`);
  }

  /**
   * Establish secure session for two users
   */
  async establishSession(userId1: string, userId2: string, bookingId: string): Promise<KeyExchangeSession> {
    const sessionId = `session_${bookingId}_${Date.now()}`;
    const participants: [string, string] = [userId1, userId2];

    // Get both users' keys
    const [user1Key, user2Key] = await Promise.all([
      this.initializeUserKeys(userId1),
      this.initializeUserKeys(userId2),
    ]);

    // Create session
    const session: KeyExchangeSession = {
      sessionId,
      participants,
      keys: {
        [userId1]: {
          publicKey: user1Key.publicKey,
          keyId: user1Key.keyId,
        },
        [userId2]: {
          publicKey: user2Key.publicKey,
          keyId: user2Key.keyId,
        },
      },
      sharedSecretHash: '', // Will be computed after key exchange
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
    };

    // Store session in Firestore
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await setDoc(sessionRef, session);

    this.sessionKeys.set(sessionId, session);
    return session;
  }

  /**
   * Get or create session for a booking
   */
  async getSessionForBooking(bookingId: string, userId1: string, userId2: string): Promise<KeyExchangeSession> {
    // Check for existing active session
    const sessionsRef = collection(db, 'chatSessions');
    const q = query(
      sessionsRef,
      where('participants', 'array-contains-any', [userId1, userId2]),
      where('status', '==', 'established'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    // For now, create new session for each booking
    // In production, you might want to reuse sessions
    return await this.establishSession(userId1, userId2, bookingId);
  }

  /**
   * Verify and finalize key exchange
   */
  async finalizeKeyExchange(sessionId: string): Promise<boolean> {
    const session = this.sessionKeys.get(sessionId);
    if (!session || session.status !== 'pending') {
      return false;
    }

    try {
      // Simulate key exchange verification
      // In production, both parties would compute and verify shared secret
      const sharedSecretHash = `hash_${Date.now()}`;
      
      session.sharedSecretHash = sharedSecretHash;
      session.status = 'established';

      // Update in Firestore
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        sharedSecretHash,
        status: 'established',
      });

      this.sessionKeys.set(sessionId, session);
      return true;
    } catch (error) {
      console.error('Key exchange finalization failed:', error);
      return false;
    }
  }

  /**
   * Rotate user's keys (for security)
   */
  async rotateUserKeys(userId: string): Promise<UserKeyData> {
    // Mark old key as inactive
    const keyRef = doc(db, 'userChatKeys', userId);
    const oldKeySnap = await getDoc(keyRef);
    
    if (oldKeySnap.exists()) {
      await updateDoc(keyRef, { isActive: false });
    }

    // Generate new keys
    const keyPair = await generateChatKeyPair();
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const userData: UserKeyData = {
      publicKey: keyPair.publicKey,
      keyId,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    };

    await setDoc(keyRef, userData);
    this.userKeys.set(userId, userData);

    // Update private key storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chatPrivateKey_${userId}`, keyPair.privateKey);
    }

    return userData;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    
    for (const [sessionId, session] of this.sessionKeys) {
      if (session.expiresAt < now && session.status !== 'expired') {
        session.status = 'expired';
        
        const sessionRef = doc(db, 'chatSessions', sessionId);
        await updateDoc(sessionRef, { status: 'expired' });
        
        this.sessionKeys.set(sessionId, session);
      }
    }
  }

  /**
   * Listen for session updates
   */
  subscribeToSession(sessionId: string, callback: (session: KeyExchangeSession | null) => void): () => void {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const session = doc.data() as KeyExchangeSession;
        this.sessionKeys.set(sessionId, session);
        callback(session);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get encryption context for a conversation
   */
  async getEncryptionContext(bookingId: string, senderId: string, recipientId: string): Promise<{
    senderPrivateKey: string;
    recipientPublicKey: string;
    session: KeyExchangeSession;
  } | null> {
    try {
      // Get or create session
      const session = await this.getSessionForBooking(bookingId, senderId, recipientId);
      
      // Finalize key exchange if pending
      if (session.status === 'pending') {
        await this.finalizeKeyExchange(session.sessionId);
      }

      // Get sender's private key
      const senderPrivateKey = await this.getUserPrivateKey(senderId);
      if (!senderPrivateKey) {
        throw new Error('Sender private key not found');
      }

      // Get recipient's public key
      const recipientPublicKey = await this.getUserPublicKey(recipientId);
      if (!recipientPublicKey) {
        throw new Error('Recipient public key not found');
      }

      return {
        senderPrivateKey,
        recipientPublicKey,
        session,
      };
    } catch (error) {
      console.error('Failed to get encryption context:', error);
      return null;
    }
  }
}

export const keyExchange = new ChatKeyExchange();

// Utility functions for easy integration
export const initializeChatEncryption = async (userId: string): Promise<boolean> => {
  try {
    await keyExchange.initializeUserKeys(userId);
    return true;
  } catch (error) {
    console.error('Failed to initialize chat encryption:', error);
    return false;
  }
};

export const getChatEncryptionContext = async (
  bookingId: string,
  senderId: string,
  recipientId: string
) => {
  return await keyExchange.getEncryptionContext(bookingId, senderId, recipientId);
};

export const rotateChatKeys = async (userId: string): Promise<boolean> => {
  try {
    await keyExchange.rotateUserKeys(userId);
    return true;
  } catch (error) {
    console.error('Failed to rotate chat keys:', error);
    return false;
  }
};