/**
 * Tests for End-to-End Encryption Service
 */

import { E2EEncryptionService, validateEncryptedMessage, validateKeyPair } from '../e2e-chat';

// Mock libsodium
jest.mock('libsodium-wrappers', () => ({
  ready: Promise.resolve(),
  crypto_box_keypair: () => ({
    publicKey: new Uint8Array(32).fill(1),
    privateKey: new Uint8Array(32).fill(2)
  }),
  crypto_box_NONCEBYTES: 24,
  crypto_box_PUBLICKEYBYTES: 32,
  randombytes_buf: (size: number) => new Uint8Array(size).fill(3),
  from_string: (str: string) => new TextEncoder().encode(str),
  to_string: (bytes: Uint8Array) => new TextDecoder().decode(bytes),
  crypto_box_easy: (message: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array) => {
    // Simple mock encryption - just return modified message
    return new Uint8Array([...message, ...nonce.slice(0, 4)]);
  },
  crypto_box_open_easy: (encryptedBytes: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array) => {
    // Simple mock decryption - remove the nonce bytes
    return encryptedBytes.slice(0, -4);
  },
  to_base64: (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)),
  from_base64: (str: string) => new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
}));

// Mock localStorage
const mockLocalStorage = {
  data: {} as { [key: string]: string },
  getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.data[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.data = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('E2EEncryptionService', () => {
  let encryptionService: E2EEncryptionService;

  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    encryptionService = new E2EEncryptionService();
  });

  describe('Key Generation and Management', () => {
    it('should generate a new key pair', async () => {
      const keyPair = await encryptionService.generateKeyPair();
      
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should store and retrieve public key', async () => {
      const keyPair = await encryptionService.generateKeyPair();
      const retrievedPublicKey = await encryptionService.getPublicKey();
      
      expect(retrievedPublicKey).toBe(keyPair.publicKey);
    });

    it('should store contact public keys', async () => {
      const contactId = 'contact123';
      const contactPublicKey = 'mock_public_key_base64';
      
      await encryptionService.storeContactPublicKey(contactId, contactPublicKey);
      const retrievedKey = await encryptionService.getContactPublicKey(contactId);
      
      expect(retrievedKey).toBe(contactPublicKey);
    });

    it('should persist contact keys in localStorage', async () => {
      const contactId = 'contact123';
      const contactPublicKey = 'mock_public_key_base64';
      
      await encryptionService.storeContactPublicKey(contactId, contactPublicKey);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'e2e_contact_keys',
        JSON.stringify({ [contactId]: contactPublicKey })
      );
    });

    it('should get encryption status', async () => {
      const status = await encryptionService.getEncryptionStatus();
      
      expect(status).toHaveProperty('hasKeys');
      expect(status).toHaveProperty('publicKey');
      expect(status).toHaveProperty('contactsWithKeys');
      expect(typeof status.hasKeys).toBe('boolean');
      expect(typeof status.contactsWithKeys).toBe('number');
    });
  });

  describe('Message Encryption and Decryption', () => {
    beforeEach(async () => {
      // Set up keys for testing
      await encryptionService.generateKeyPair();
      await encryptionService.storeContactPublicKey('recipient123', 'recipient_public_key');
    });

    it('should encrypt a message', async () => {
      const message = 'Hello, this is a secret message!';
      const recipientId = 'recipient123';
      const messageId = 'msg123';

      const encryptedMessage = await encryptionService.encryptMessage(
        message,
        recipientId,
        messageId
      );

      expect(encryptedMessage).toHaveProperty('encryptedContent');
      expect(encryptedMessage).toHaveProperty('nonce');
      expect(encryptedMessage).toHaveProperty('senderPublicKey');
      expect(encryptedMessage).toHaveProperty('timestamp');
      expect(encryptedMessage).toHaveProperty('messageId');
      expect(encryptedMessage.messageId).toBe(messageId);
      expect(typeof encryptedMessage.encryptedContent).toBe('string');
      expect(typeof encryptedMessage.nonce).toBe('string');
    });

    it('should decrypt a message', async () => {
      const originalMessage = 'Hello, this is a secret message!';
      const senderId = 'sender123';
      const messageId = 'msg123';

      // First encrypt a message
      await encryptionService.storeContactPublicKey('recipient123', 'recipient_key');
      const encryptedMessage = await encryptionService.encryptMessage(
        originalMessage,
        'recipient123',
        messageId
      );

      // Then decrypt it
      await encryptionService.storeContactPublicKey(senderId, encryptedMessage.senderPublicKey);
      const decryptedMessage = await encryptionService.decryptMessage(
        encryptedMessage,
        senderId
      );

      expect(decryptedMessage.content).toBe(originalMessage);
      expect(decryptedMessage.messageId).toBe(messageId);
      expect(decryptedMessage.senderPublicKey).toBe(encryptedMessage.senderPublicKey);
      expect(typeof decryptedMessage.isVerified).toBe('boolean');
    });

    it('should fail to encrypt without recipient public key', async () => {
      const message = 'Hello, this is a secret message!';
      const recipientId = 'unknown_recipient';
      const messageId = 'msg123';

      await expect(
        encryptionService.encryptMessage(message, recipientId, messageId)
      ).rejects.toThrow('No public key found for recipient');
    });

    it('should fail to encrypt without own key pair', async () => {
      const freshService = new E2EEncryptionService();
      const message = 'Hello, this is a secret message!';
      const recipientId = 'recipient123';
      const messageId = 'msg123';

      await expect(
        freshService.encryptMessage(message, recipientId, messageId)
      ).rejects.toThrow('No key pair available');
    });

    it('should verify message authenticity', async () => {
      const originalMessage = 'Hello, this is a secret message!';
      const senderId = 'sender123';
      const messageId = 'msg123';
      
      // Encrypt message
      await encryptionService.storeContactPublicKey('recipient123', 'recipient_key');
      const encryptedMessage = await encryptionService.encryptMessage(
        originalMessage,
        'recipient123',
        messageId
      );

      // Store correct sender key for verification
      await encryptionService.storeContactPublicKey(senderId, encryptedMessage.senderPublicKey);
      
      const decryptedMessage = await encryptionService.decryptMessage(
        encryptedMessage,
        senderId
      );

      expect(decryptedMessage.isVerified).toBe(true);
    });

    it('should detect unverified messages', async () => {
      const originalMessage = 'Hello, this is a secret message!';
      const senderId = 'sender123';
      const messageId = 'msg123';
      
      // Encrypt message
      await encryptionService.storeContactPublicKey('recipient123', 'recipient_key');
      const encryptedMessage = await encryptionService.encryptMessage(
        originalMessage,
        'recipient123',
        messageId
      );

      // Store different sender key (simulating key mismatch)
      await encryptionService.storeContactPublicKey(senderId, 'different_public_key');
      
      const decryptedMessage = await encryptionService.decryptMessage(
        encryptedMessage,
        senderId
      );

      expect(decryptedMessage.isVerified).toBe(false);
    });
  });

  describe('Key Exchange', () => {
    beforeEach(async () => {
      await encryptionService.generateKeyPair();
    });

    it('should initiate key exchange', async () => {
      const otherUserId = 'user123';
      
      const exchangeData = await encryptionService.initiateKeyExchange(otherUserId);
      
      expect(exchangeData).toHaveProperty('myPublicKey');
      expect(exchangeData).toHaveProperty('exchangeId');
      expect(typeof exchangeData.myPublicKey).toBe('string');
      expect(typeof exchangeData.exchangeId).toBe('string');
      expect(exchangeData.exchangeId).toMatch(/^exchange_/);
    });

    it('should complete key exchange', async () => {
      const otherUserId = 'user123';
      const otherPublicKey = 'other_user_public_key';
      const exchangeId = 'exchange123';
      
      const result = await encryptionService.completeKeyExchange(
        otherUserId,
        otherPublicKey,
        exchangeId
      );
      
      expect(result).toBe(true);
      
      const storedKey = await encryptionService.getContactPublicKey(otherUserId);
      expect(storedKey).toBe(otherPublicKey);
    });

    it('should reject invalid public key in key exchange', async () => {
      const otherUserId = 'user123';
      const invalidPublicKey = 'invalid_key';
      const exchangeId = 'exchange123';
      
      const result = await encryptionService.completeKeyExchange(
        otherUserId,
        invalidPublicKey,
        exchangeId
      );
      
      expect(result).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should check if encryption is available for contact', async () => {
      await encryptionService.generateKeyPair();
      
      // No contact key stored
      let canEncrypt = await encryptionService.canEncryptTo('user123');
      expect(canEncrypt).toBe(false);
      
      // Store contact key
      await encryptionService.storeContactPublicKey('user123', 'contact_public_key');
      canEncrypt = await encryptionService.canEncryptTo('user123');
      expect(canEncrypt).toBe(true);
    });

    it('should remove contact key', async () => {
      const contactId = 'contact123';
      await encryptionService.storeContactPublicKey(contactId, 'public_key');
      
      let storedKey = await encryptionService.getContactPublicKey(contactId);
      expect(storedKey).toBe('public_key');
      
      await encryptionService.removeContactKey(contactId);
      storedKey = await encryptionService.getContactPublicKey(contactId);
      expect(storedKey).toBeNull();
    });

    it('should clear all keys', async () => {
      await encryptionService.generateKeyPair();
      await encryptionService.storeContactPublicKey('contact123', 'public_key');
      
      let publicKey = await encryptionService.getPublicKey();
      expect(publicKey).toBeTruthy();
      
      await encryptionService.clearAllKeys();
      
      publicKey = await encryptionService.getPublicKey();
      expect(publicKey).toBeNull();
      
      const contactKey = await encryptionService.getContactPublicKey('contact123');
      expect(contactKey).toBeNull();
    });
  });

  describe('Validation Functions', () => {
    it('should validate encrypted message format', () => {
      const validMessage = {
        encryptedContent: 'encrypted_data',
        nonce: 'nonce_data',
        senderPublicKey: 'sender_public_key',
        timestamp: Date.now(),
        messageId: 'msg123'
      };
      
      expect(validateEncryptedMessage(validMessage)).toBe(true);
      
      const invalidMessage = {
        encryptedContent: 'encrypted_data',
        // Missing nonce
        senderPublicKey: 'sender_public_key',
        timestamp: Date.now(),
        messageId: 'msg123'
      };
      
      expect(validateEncryptedMessage(invalidMessage)).toBe(false);
    });

    it('should validate key pair format', () => {
      const validKeyPair = {
        publicKey: 'public_key_data',
        privateKey: 'private_key_data'
      };
      
      expect(validateKeyPair(validKeyPair)).toBe(true);
      
      const invalidKeyPair = {
        publicKey: 'public_key_data'
        // Missing privateKey
      };
      
      expect(validateKeyPair(invalidKeyPair)).toBe(false);
    });
  });
});