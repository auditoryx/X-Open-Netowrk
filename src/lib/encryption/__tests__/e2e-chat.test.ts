/**
 * Tests for End-to-End Chat Encryption
 */

import { 
  WebChatEncryption, 
  encryptChatMessage, 
  decryptChatMessage, 
  generateChatKeyPair,
  isEncryptionSupported 
} from '../e2e-chat';

// Mock window.crypto for testing
const mockCrypto = {
  subtle: {
    generateKey: jest.fn(),
    exportKey: jest.fn(),
    importKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    deriveBits: jest.fn(),
  },
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

// Mock Buffer for Node.js compatibility
const mockBuffer = {
  from: jest.fn((data, encoding) => {
    if (encoding === 'base64') {
      // Simple base64 decode mock
      return new Uint8Array([1, 2, 3, 4]);
    }
    return new Uint8Array([1, 2, 3, 4]);
  }),
};

// Setup global mocks
declare global {
  var window: {
    crypto: typeof mockCrypto;
  };
  var Buffer: typeof mockBuffer;
}

global.window = { crypto: mockCrypto } as any;
global.Buffer = mockBuffer as any;

describe('E2E Chat Encryption', () => {
  let chatEncryption: WebChatEncryption;

  beforeEach(() => {
    chatEncryption = new WebChatEncryption();
    jest.clearAllMocks();
  });

  describe('isEncryptionSupported', () => {
    it('should return true when crypto.subtle is available', () => {
      expect(isEncryptionSupported()).toBe(true);
    });

    it('should return false when crypto.subtle is not available', () => {
      const originalCrypto = global.window.crypto;
      global.window.crypto = { subtle: null } as any;
      
      expect(isEncryptionSupported()).toBe(false);
      
      global.window.crypto = originalCrypto;
    });
  });

  describe('WebChatEncryption', () => {
    beforeEach(() => {
      // Mock successful key generation
      mockCrypto.subtle.generateKey.mockResolvedValue({
        publicKey: 'mockPublicKey',
        privateKey: 'mockPrivateKey',
      });

      mockCrypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(32));
      mockCrypto.subtle.importKey.mockResolvedValue('mockImportedKey');
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));
      mockCrypto.subtle.decrypt.mockResolvedValue(new ArrayBuffer(16));
      mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));
    });

    describe('generateKeyPair', () => {
      it('should generate a key pair successfully', async () => {
        const keyPair = await chatEncryption.generateKeyPair();

        expect(keyPair).toHaveProperty('publicKey');
        expect(keyPair).toHaveProperty('privateKey');
        expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
        expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
        expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDH',
            namedCurve: 'P-256',
          },
          true,
          ['deriveKey', 'deriveBits']
        );
      });

      it('should handle key generation failure', async () => {
        mockCrypto.subtle.generateKey.mockRejectedValue(new Error('Key generation failed'));

        await expect(chatEncryption.generateKeyPair()).rejects.toThrow('Key generation failed');
      });
    });

    describe('encryptMessage', () => {
      it('should encrypt a message successfully', async () => {
        const message = 'Hello, world!';
        const recipientPublicKey = new Uint8Array([1, 2, 3, 4]);
        const senderPrivateKey = new Uint8Array([5, 6, 7, 8]);

        const encrypted = await chatEncryption.encryptMessage(message, recipientPublicKey, senderPrivateKey);

        expect(encrypted).toHaveProperty('ciphertext');
        expect(encrypted).toHaveProperty('nonce');
        expect(encrypted).toHaveProperty('senderPublicKey');
        expect(encrypted.ciphertext).toBeInstanceOf(Uint8Array);
        expect(encrypted.nonce).toBeInstanceOf(Uint8Array);
        expect(encrypted.senderPublicKey).toBeInstanceOf(Uint8Array);
      });

      it('should handle encryption failure', async () => {
        mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));
        
        const message = 'Hello, world!';
        const recipientPublicKey = new Uint8Array([1, 2, 3, 4]);
        const senderPrivateKey = new Uint8Array([5, 6, 7, 8]);

        await expect(
          chatEncryption.encryptMessage(message, recipientPublicKey, senderPrivateKey)
        ).rejects.toThrow('Encryption failed');
      });
    });

    describe('decryptMessage', () => {
      it('should decrypt a message successfully', async () => {
        // Mock TextDecoder
        const mockTextDecoder = {
          decode: jest.fn().mockReturnValue('Hello, world!'),
        };
        global.TextDecoder = jest.fn().mockImplementation(() => mockTextDecoder);

        const encrypted = {
          ciphertext: new Uint8Array([1, 2, 3, 4]),
          nonce: new Uint8Array([5, 6, 7, 8]),
          senderPublicKey: new Uint8Array([9, 10, 11, 12]),
        };
        const recipientPrivateKey = new Uint8Array([13, 14, 15, 16]);

        const decrypted = await chatEncryption.decryptMessage(encrypted, recipientPrivateKey);

        expect(decrypted).toHaveProperty('plaintext');
        expect(decrypted).toHaveProperty('senderPublicKey');
        expect(decrypted.plaintext).toBe('Hello, world!');
        expect(decrypted.senderPublicKey).toEqual(encrypted.senderPublicKey);
      });

      it('should handle decryption failure', async () => {
        mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));
        
        const encrypted = {
          ciphertext: new Uint8Array([1, 2, 3, 4]),
          nonce: new Uint8Array([5, 6, 7, 8]),
          senderPublicKey: new Uint8Array([9, 10, 11, 12]),
        };
        const recipientPrivateKey = new Uint8Array([13, 14, 15, 16]);

        await expect(
          chatEncryption.decryptMessage(encrypted, recipientPrivateKey)
        ).rejects.toThrow('Decryption failed');
      });
    });

    describe('exchangeKeys', () => {
      it('should perform key exchange successfully', async () => {
        const localPrivateKey = new Uint8Array([1, 2, 3, 4]);
        const remotePublicKey = new Uint8Array([5, 6, 7, 8]);

        const sharedSecret = await chatEncryption.exchangeKeys(localPrivateKey, remotePublicKey);

        expect(sharedSecret).toBeInstanceOf(Uint8Array);
        expect(mockCrypto.subtle.deriveBits).toHaveBeenCalled();
      });

      it('should handle key exchange failure', async () => {
        mockCrypto.subtle.deriveBits.mockRejectedValue(new Error('Key exchange failed'));
        
        const localPrivateKey = new Uint8Array([1, 2, 3, 4]);
        const remotePublicKey = new Uint8Array([5, 6, 7, 8]);

        await expect(
          chatEncryption.exchangeKeys(localPrivateKey, remotePublicKey)
        ).rejects.toThrow('Key exchange failed');
      });
    });
  });

  describe('High-level encryption functions', () => {
    beforeEach(() => {
      // Mock successful operations for high-level functions
      mockCrypto.subtle.generateKey.mockResolvedValue({
        publicKey: 'mockPublicKey',
        privateKey: 'mockPrivateKey',
      });

      mockCrypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(32));
      mockCrypto.subtle.importKey.mockResolvedValue('mockImportedKey');
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));
      mockCrypto.subtle.decrypt.mockResolvedValue(new ArrayBuffer(16));
      mockCrypto.subtle.deriveBits.mockResolvedValue(new ArrayBuffer(32));
    });

    describe('generateChatKeyPair', () => {
      it('should generate and return base64 encoded key pair', async () => {
        const keyPair = await generateChatKeyPair();

        expect(keyPair).toHaveProperty('publicKey');
        expect(keyPair).toHaveProperty('privateKey');
        expect(typeof keyPair.publicKey).toBe('string');
        expect(typeof keyPair.privateKey).toBe('string');
      });
    });

    describe('encryptChatMessage', () => {
      it('should encrypt and serialize message', async () => {
        const message = 'Test message';
        const recipientPublicKey = 'dGVzdC1wdWJsaWMta2V5'; // base64 encoded
        const senderPrivateKey = 'dGVzdC1wcml2YXRlLWtleQ=='; // base64 encoded

        const encrypted = await encryptChatMessage(message, recipientPublicKey, senderPrivateKey);

        expect(typeof encrypted).toBe('string');
        expect(() => JSON.parse(encrypted)).not.toThrow();
        
        const parsed = JSON.parse(encrypted);
        expect(parsed).toHaveProperty('ciphertext');
        expect(parsed).toHaveProperty('nonce');
        expect(parsed).toHaveProperty('senderPublicKey');
      });

      it('should handle encryption errors gracefully', async () => {
        mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));
        
        const message = 'Test message';
        const recipientPublicKey = 'dGVzdC1wdWJsaWMta2V5';
        const senderPrivateKey = 'dGVzdC1wcml2YXRlLWtleQ==';

        await expect(
          encryptChatMessage(message, recipientPublicKey, senderPrivateKey)
        ).rejects.toThrow('Failed to encrypt chat message');
      });
    });

    describe('decryptChatMessage', () => {
      it('should decrypt serialized message', async () => {
        // Mock TextDecoder
        const mockTextDecoder = {
          decode: jest.fn().mockReturnValue('Test message'),
        };
        global.TextDecoder = jest.fn().mockImplementation(() => mockTextDecoder);

        const encryptedData = JSON.stringify({
          ciphertext: 'dGVzdC1jaXBoZXJ0ZXh0',
          nonce: 'dGVzdC1ub25jZQ==',
          senderPublicKey: 'dGVzdC1wdWJsaWMta2V5',
        });
        const recipientPrivateKey = 'dGVzdC1wcml2YXRlLWtleQ==';

        const decrypted = await decryptChatMessage(encryptedData, recipientPrivateKey);

        expect(decrypted).toBe('Test message');
      });

      it('should handle decryption errors gracefully', async () => {
        mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));
        
        const encryptedData = JSON.stringify({
          ciphertext: 'dGVzdC1jaXBoZXJ0ZXh0',
          nonce: 'dGVzdC1ub25jZQ==',
          senderPublicKey: 'dGVzdC1wdWJsaWMta2V5',
        });
        const recipientPrivateKey = 'dGVzdC1wcml2YXRlLWtleQ==';

        await expect(
          decryptChatMessage(encryptedData, recipientPrivateKey)
        ).rejects.toThrow('Failed to decrypt chat message');
      });

      it('should handle invalid encrypted data format', async () => {
        const invalidData = 'invalid-json-data';
        const recipientPrivateKey = 'dGVzdC1wcml2YXRlLWtleQ==';

        await expect(
          decryptChatMessage(invalidData, recipientPrivateKey)
        ).rejects.toThrow('Failed to decrypt chat message');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle missing window object gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(isEncryptionSupported()).toBe(false);

      global.window = originalWindow;
    });

    it('should handle missing crypto.subtle gracefully', () => {
      const originalCrypto = global.window.crypto;
      global.window.crypto = {} as any;

      expect(isEncryptionSupported()).toBe(false);

      global.window.crypto = originalCrypto;
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete encrypt-decrypt cycle', async () => {
      // Mock TextEncoder and TextDecoder
      const mockTextEncoder = {
        encode: jest.fn().mockReturnValue(new Uint8Array([72, 101, 108, 108, 111])), // "Hello"
      };
      const mockTextDecoder = {
        decode: jest.fn().mockReturnValue('Hello, secure world!'),
      };
      global.TextEncoder = jest.fn().mockImplementation(() => mockTextEncoder);
      global.TextDecoder = jest.fn().mockImplementation(() => mockTextDecoder);

      const message = 'Hello, secure world!';
      const recipientKeyPair = await chatEncryption.generateKeyPair();
      const senderKeyPair = await chatEncryption.generateKeyPair();

      // Encrypt message
      const encrypted = await chatEncryption.encryptMessage(
        message,
        recipientKeyPair.publicKey,
        senderKeyPair.privateKey
      );

      // Decrypt message
      const decrypted = await chatEncryption.decryptMessage(encrypted, recipientKeyPair.privateKey);

      expect(decrypted.plaintext).toBe(message);
      expect(decrypted.senderPublicKey).toEqual(encrypted.senderPublicKey);
    });

    it('should fail to decrypt with wrong private key', async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Authentication tag verification failed'));

      const message = 'Secret message';
      const recipientKeyPair = await chatEncryption.generateKeyPair();
      const senderKeyPair = await chatEncryption.generateKeyPair();
      const wrongKeyPair = await chatEncryption.generateKeyPair();

      const encrypted = await chatEncryption.encryptMessage(
        message,
        recipientKeyPair.publicKey,
        senderKeyPair.privateKey
      );

      await expect(
        chatEncryption.decryptMessage(encrypted, wrongKeyPair.privateKey)
      ).rejects.toThrow('Decryption failed');
    });
  });
});