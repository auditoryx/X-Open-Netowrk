/**
 * Tests for Key Exchange System
 */

import { keyExchange, initializeChatEncryption, getChatEncryptionContext } from '../key-exchange';

// Mock Firebase Firestore
const mockFirestore = {
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
};

// Mock the firebase module
jest.mock('@/lib/firebase', () => ({
  db: mockFirestore,
}));

// Mock the e2e-chat module
jest.mock('../e2e-chat', () => ({
  generateChatKeyPair: jest.fn().mockResolvedValue({
    publicKey: 'mock-public-key-base64',
    privateKey: 'mock-private-key-base64',
  }),
  chatEncryption: {
    generateKeyPair: jest.fn().mockResolvedValue({
      publicKey: new Uint8Array([1, 2, 3, 4]),
      privateKey: new Uint8Array([5, 6, 7, 8]),
    }),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Key Exchange System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockFirestore.doc.mockReturnValue({ id: 'mock-doc-ref' });
    mockFirestore.getDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
    });
    mockFirestore.setDoc.mockResolvedValue(undefined);
    mockFirestore.updateDoc.mockResolvedValue(undefined);
    mockFirestore.collection.mockReturnValue({ id: 'mock-collection-ref' });
    mockFirestore.addDoc.mockResolvedValue({ id: 'mock-doc-id' });
  });

  describe('initializeChatEncryption', () => {
    it('should initialize encryption for a new user', async () => {
      const userId = 'user123';
      
      const result = await initializeChatEncryption(userId);

      expect(result).toBe(true);
      expect(mockFirestore.doc).toHaveBeenCalledWith(mockFirestore, 'userChatKeys', userId);
      expect(mockFirestore.getDoc).toHaveBeenCalled();
      expect(mockFirestore.setDoc).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `chatPrivateKey_${userId}`,
        'mock-private-key-base64'
      );
    });

    it('should return existing keys for an existing user', async () => {
      const userId = 'user123';
      const existingUserData = {
        publicKey: 'existing-public-key',
        keyId: 'existing-key-id',
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingUserData,
      });

      const result = await initializeChatEncryption(userId);

      expect(result).toBe(true);
      expect(mockFirestore.setDoc).not.toHaveBeenCalled(); // Should not create new keys
    });

    it('should handle initialization errors gracefully', async () => {
      const userId = 'user123';
      
      mockFirestore.getDoc.mockRejectedValue(new Error('Database error'));

      const result = await initializeChatEncryption(userId);

      expect(result).toBe(false);
    });
  });

  describe('getUserPublicKey', () => {
    it('should retrieve public key for existing user', async () => {
      const userId = 'user123';
      const userData = {
        publicKey: 'user-public-key',
        keyId: 'key-id',
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => userData,
      });

      const publicKey = await keyExchange.getUserPublicKey(userId);

      expect(publicKey).toBe('user-public-key');
      expect(mockFirestore.doc).toHaveBeenCalledWith(mockFirestore, 'userChatKeys', userId);
    });

    it('should return null for non-existent user', async () => {
      const userId = 'nonexistent';

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const publicKey = await keyExchange.getUserPublicKey(userId);

      expect(publicKey).toBeNull();
    });

    it('should use cached key if available', async () => {
      const userId = 'user123';
      const userData = {
        publicKey: 'cached-public-key',
        keyId: 'key-id',
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
      };

      // Initialize cache
      await keyExchange.initializeUserKeys(userId);
      
      // Clear the getDoc mock to ensure it's not called again
      mockFirestore.getDoc.mockClear();

      const publicKey = await keyExchange.getUserPublicKey(userId);

      expect(publicKey).toBe('mock-public-key-base64');
      expect(mockFirestore.getDoc).not.toHaveBeenCalled(); // Should use cache
    });
  });

  describe('getUserPrivateKey', () => {
    it('should retrieve private key from localStorage', async () => {
      const userId = 'user123';
      const mockPrivateKey = 'stored-private-key';

      mockLocalStorage.getItem.mockReturnValue(mockPrivateKey);

      const privateKey = await keyExchange.getUserPrivateKey(userId);

      expect(privateKey).toBe(mockPrivateKey);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`chatPrivateKey_${userId}`);
    });

    it('should return null if private key not found', async () => {
      const userId = 'user123';

      mockLocalStorage.getItem.mockReturnValue(null);

      const privateKey = await keyExchange.getUserPrivateKey(userId);

      expect(privateKey).toBeNull();
    });

    it('should return null in non-browser environment', async () => {
      // Mock non-browser environment
      const originalWindow = global.window;
      delete (global as any).window;

      const privateKey = await keyExchange.getUserPrivateKey('user123');

      expect(privateKey).toBeNull();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('establishSession', () => {
    it('should create a new session for two users', async () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const bookingId = 'booking123';

      // Mock user keys
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      }).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      });

      const session = await keyExchange.establishSession(userId1, userId2, bookingId);

      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('participants');
      expect(session).toHaveProperty('keys');
      expect(session.participants).toEqual([userId1, userId2]);
      expect(session.status).toBe('pending');
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });

    it('should include both users\' keys in session', async () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const bookingId = 'booking123';

      const session = await keyExchange.establishSession(userId1, userId2, bookingId);

      expect(session.keys).toHaveProperty(userId1);
      expect(session.keys).toHaveProperty(userId2);
      expect(session.keys[userId1]).toHaveProperty('publicKey');
      expect(session.keys[userId1]).toHaveProperty('keyId');
      expect(session.keys[userId2]).toHaveProperty('publicKey');
      expect(session.keys[userId2]).toHaveProperty('keyId');
    });
  });

  describe('getSessionForBooking', () => {
    it('should create new session for booking', async () => {
      const bookingId = 'booking123';
      const userId1 = 'user1';
      const userId2 = 'user2';

      const session = await keyExchange.getSessionForBooking(bookingId, userId1, userId2);

      expect(session).toHaveProperty('sessionId');
      expect(session.participants).toEqual([userId1, userId2]);
      expect(session.status).toBe('pending');
    });
  });

  describe('finalizeKeyExchange', () => {
    it('should finalize pending session', async () => {
      const sessionId = 'session123';
      const session = {
        sessionId,
        participants: ['user1', 'user2'] as [string, string],
        keys: {
          user1: { publicKey: 'key1', keyId: 'id1' },
          user2: { publicKey: 'key2', keyId: 'id2' },
        },
        sharedSecretHash: '',
        createdAt: new Date(),
        expiresAt: new Date(),
        status: 'pending' as const,
      };

      // Setup session in cache
      (keyExchange as any).sessionKeys.set(sessionId, session);

      const result = await keyExchange.finalizeKeyExchange(sessionId);

      expect(result).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        expect.objectContaining({
          status: 'established',
        })
      );
    });

    it('should fail to finalize non-existent session', async () => {
      const sessionId = 'nonexistent';

      const result = await keyExchange.finalizeKeyExchange(sessionId);

      expect(result).toBe(false);
    });

    it('should fail to finalize already established session', async () => {
      const sessionId = 'session123';
      const session = {
        sessionId,
        participants: ['user1', 'user2'] as [string, string],
        keys: {
          user1: { publicKey: 'key1', keyId: 'id1' },
          user2: { publicKey: 'key2', keyId: 'id2' },
        },
        sharedSecretHash: 'existing-hash',
        createdAt: new Date(),
        expiresAt: new Date(),
        status: 'established' as const,
      };

      (keyExchange as any).sessionKeys.set(sessionId, session);

      const result = await keyExchange.finalizeKeyExchange(sessionId);

      expect(result).toBe(false);
      expect(mockFirestore.updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('rotateUserKeys', () => {
    it('should rotate user keys successfully', async () => {
      const userId = 'user123';

      // Mock existing key
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          publicKey: 'old-key',
          keyId: 'old-id',
          isActive: true,
        }),
      });

      const newUserData = await keyExchange.rotateUserKeys(userId);

      expect(newUserData).toHaveProperty('publicKey');
      expect(newUserData).toHaveProperty('keyId');
      expect(newUserData.isActive).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        { isActive: false }
      );
      expect(mockFirestore.setDoc).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getChatEncryptionContext', () => {
    it('should return encryption context for valid booking', async () => {
      const bookingId = 'booking123';
      const senderId = 'sender123';
      const recipientId = 'recipient123';

      mockLocalStorage.getItem.mockReturnValue('sender-private-key');

      const context = await getChatEncryptionContext(bookingId, senderId, recipientId);

      expect(context).toHaveProperty('senderPrivateKey');
      expect(context).toHaveProperty('recipientPublicKey');
      expect(context).toHaveProperty('session');
      expect(context?.senderPrivateKey).toBe('sender-private-key');
    });

    it('should return null if sender private key not found', async () => {
      const bookingId = 'booking123';
      const senderId = 'sender123';
      const recipientId = 'recipient123';

      mockLocalStorage.getItem.mockReturnValue(null);

      const context = await getChatEncryptionContext(bookingId, senderId, recipientId);

      expect(context).toBeNull();
    });

    it('should return null if recipient public key not found', async () => {
      const bookingId = 'booking123';
      const senderId = 'sender123';
      const recipientId = 'recipient123';

      mockLocalStorage.getItem.mockReturnValue('sender-private-key');
      
      // Mock recipient key not found
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const context = await getChatEncryptionContext(bookingId, senderId, recipientId);

      expect(context).toBeNull();
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should mark expired sessions as expired', async () => {
      const expiredSession = {
        sessionId: 'expired-session',
        participants: ['user1', 'user2'] as [string, string],
        keys: {
          user1: { publicKey: 'key1', keyId: 'id1' },
          user2: { publicKey: 'key2', keyId: 'id2' },
        },
        sharedSecretHash: 'hash',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        status: 'established' as const,
      };

      (keyExchange as any).sessionKeys.set('expired-session', expiredSession);

      await keyExchange.cleanupExpiredSessions();

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        { status: 'expired' }
      );
    });

    it('should not affect non-expired sessions', async () => {
      const activeSession = {
        sessionId: 'active-session',
        participants: ['user1', 'user2'] as [string, string],
        keys: {
          user1: { publicKey: 'key1', keyId: 'id1' },
          user2: { publicKey: 'key2', keyId: 'id2' },
        },
        sharedSecretHash: 'hash',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000), // Expires in 1 minute
        status: 'established' as const,
      };

      (keyExchange as any).sessionKeys.set('active-session', activeSession);

      await keyExchange.cleanupExpiredSessions();

      expect(mockFirestore.updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToSession', () => {
    it('should set up session subscription', () => {
      const sessionId = 'session123';
      const callback = jest.fn();

      mockFirestore.onSnapshot.mockReturnValue(() => {});

      const unsubscribe = keyExchange.subscribeToSession(sessionId, callback);

      expect(mockFirestore.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with session data', () => {
      const sessionId = 'session123';
      const callback = jest.fn();
      const sessionData = {
        sessionId,
        participants: ['user1', 'user2'],
        status: 'established',
      };

      let onSnapshotCallback: (doc: any) => void;
      mockFirestore.onSnapshot.mockImplementation((ref, cb) => {
        onSnapshotCallback = cb;
        return () => {};
      });

      keyExchange.subscribeToSession(sessionId, callback);

      // Simulate document update
      onSnapshotCallback!({
        exists: () => true,
        data: () => sessionData,
      });

      expect(callback).toHaveBeenCalledWith(sessionData);
    });

    it('should call callback with null for non-existent session', () => {
      const sessionId = 'session123';
      const callback = jest.fn();

      let onSnapshotCallback: (doc: any) => void;
      mockFirestore.onSnapshot.mockImplementation((ref, cb) => {
        onSnapshotCallback = cb;
        return () => {};
      });

      keyExchange.subscribeToSession(sessionId, callback);

      // Simulate document not found
      onSnapshotCallback!({
        exists: () => false,
      });

      expect(callback).toHaveBeenCalledWith(null);
    });
  });
});