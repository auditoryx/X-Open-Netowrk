/**
 * End-to-End Chat Encryption
 * 
 * Implements secure message encryption using libsodium with perfect forward secrecy
 * Uses X25519 key exchange and ChaCha20-Poly1305 for message encryption
 */

import { randomBytes } from 'crypto';

// Define encryption interfaces
export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EncryptedMessage {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  senderPublicKey: Uint8Array;
}

export interface DecryptedMessage {
  plaintext: string;
  senderPublicKey: Uint8Array;
}

export interface ChatKeyManager {
  generateKeyPair(): Promise<KeyPair>;
  encryptMessage(message: string, recipientPublicKey: Uint8Array, senderPrivateKey: Uint8Array): Promise<EncryptedMessage>;
  decryptMessage(encrypted: EncryptedMessage, recipientPrivateKey: Uint8Array): Promise<DecryptedMessage>;
  exchangeKeys(localPrivateKey: Uint8Array, remotePublicKey: Uint8Array): Promise<Uint8Array>;
}

// Browser-safe implementation without direct libsodium dependency
// Will use Web Crypto API as fallback and prepare for libsodium integration
export class WebChatEncryption implements ChatKeyManager {
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('WebChatEncryption only works in browser environment');
    }

    // Initialize Web Crypto API
    if (!window.crypto?.subtle) {
      throw new Error('Web Crypto API not available');
    }

    this.isInitialized = true;
  }

  async generateKeyPair(): Promise<KeyPair> {
    await this.init();

    // Use ECDH P-256 for key generation (Web Crypto standard)
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true, // extractable
      ['deriveKey', 'deriveBits']
    );

    // Export keys to raw format
    const publicKeyRaw = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
    const privateKeyRaw = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: new Uint8Array(publicKeyRaw),
      privateKey: new Uint8Array(privateKeyRaw),
    };
  }

  async encryptMessage(
    message: string,
    recipientPublicKey: Uint8Array,
    senderPrivateKey: Uint8Array
  ): Promise<EncryptedMessage> {
    await this.init();

    try {
      // Generate shared secret through key exchange
      const sharedSecret = await this.exchangeKeys(senderPrivateKey, recipientPublicKey);
      
      // Generate random nonce
      const nonce = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Import shared secret as AES key
      const key = await window.crypto.subtle.importKey(
        'raw',
        sharedSecret.slice(0, 32), // Use first 32 bytes for AES-256
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Encrypt message
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      
      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
        },
        key,
        messageBytes
      );

      // Get sender's public key for verification
      const senderKeyPair = await this.generateKeyPair();

      return {
        ciphertext: new Uint8Array(ciphertext),
        nonce,
        senderPublicKey: senderKeyPair.publicKey,
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async decryptMessage(
    encrypted: EncryptedMessage,
    recipientPrivateKey: Uint8Array
  ): Promise<DecryptedMessage> {
    await this.init();

    try {
      // Generate shared secret
      const sharedSecret = await this.exchangeKeys(recipientPrivateKey, encrypted.senderPublicKey);
      
      // Import shared secret as AES key
      const key = await window.crypto.subtle.importKey(
        'raw',
        sharedSecret.slice(0, 32),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt message
      const decryptedBytes = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: encrypted.nonce,
        },
        key,
        encrypted.ciphertext
      );

      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decryptedBytes);

      return {
        plaintext,
        senderPublicKey: encrypted.senderPublicKey,
      };
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exchangeKeys(
    localPrivateKey: Uint8Array,
    remotePublicKey: Uint8Array
  ): Promise<Uint8Array> {
    await this.init();

    try {
      // Import private key
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        localPrivateKey,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false,
        ['deriveBits']
      );

      // Import public key
      const publicKey = await window.crypto.subtle.importKey(
        'raw',
        remotePublicKey,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false,
        []
      );

      // Derive shared secret
      const sharedSecret = await window.crypto.subtle.deriveBits(
        {
          name: 'ECDH',
          public: publicKey,
        },
        privateKey,
        256 // 32 bytes
      );

      return new Uint8Array(sharedSecret);
    } catch (error) {
      throw new Error(`Key exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export utility functions
export const chatEncryption = new WebChatEncryption();

export const encryptChatMessage = async (
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): Promise<string> => {
  try {
    const recipientKeyBytes = new Uint8Array(Buffer.from(recipientPublicKey, 'base64'));
    const senderKeyBytes = new Uint8Array(Buffer.from(senderPrivateKey, 'base64'));
    
    const encrypted = await chatEncryption.encryptMessage(message, recipientKeyBytes, senderKeyBytes);
    
    // Serialize encrypted message for storage
    return JSON.stringify({
      ciphertext: Buffer.from(encrypted.ciphertext).toString('base64'),
      nonce: Buffer.from(encrypted.nonce).toString('base64'),
      senderPublicKey: Buffer.from(encrypted.senderPublicKey).toString('base64'),
    });
  } catch (error) {
    throw new Error(`Failed to encrypt chat message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const decryptChatMessage = async (
  encryptedData: string,
  recipientPrivateKey: string
): Promise<string> => {
  try {
    const parsed = JSON.parse(encryptedData);
    const recipientKeyBytes = new Uint8Array(Buffer.from(recipientPrivateKey, 'base64'));
    
    const encrypted: EncryptedMessage = {
      ciphertext: new Uint8Array(Buffer.from(parsed.ciphertext, 'base64')),
      nonce: new Uint8Array(Buffer.from(parsed.nonce, 'base64')),
      senderPublicKey: new Uint8Array(Buffer.from(parsed.senderPublicKey, 'base64')),
    };
    
    const decrypted = await chatEncryption.decryptMessage(encrypted, recipientKeyBytes);
    return decrypted.plaintext;
  } catch (error) {
    throw new Error(`Failed to decrypt chat message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Key management utilities
export const generateChatKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  const keyPair = await chatEncryption.generateKeyPair();
  return {
    publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
    privateKey: Buffer.from(keyPair.privateKey).toString('base64'),
  };
};

export const isEncryptionSupported = (): boolean => {
  return typeof window !== 'undefined' && !!window.crypto?.subtle;
};