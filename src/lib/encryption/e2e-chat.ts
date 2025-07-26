/**
 * End-to-End Encryption Service for Chat Messages
 * 
 * Uses libsodium (NaCl) for secure message encryption between users
 * Implements X25519 key exchange and XSalsa20-Poly1305 authenticated encryption
 */

import sodium, { to_base64, from_base64 } from 'libsodium-wrappers';

// Ensure sodium is ready
let sodiumReady = false;

const initSodium = async () => {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
};

export interface KeyPair {
  publicKey: string; // Base64 encoded public key
  privateKey: string; // Base64 encoded private key
}

export interface EncryptedMessage {
  encryptedContent: string; // Base64 encoded encrypted message
  nonce: string; // Base64 encoded nonce
  senderPublicKey: string; // Base64 encoded sender's public key
  timestamp: number;
  messageId: string;
}

export interface DecryptedMessage {
  content: string;
  senderPublicKey: string;
  timestamp: number;
  messageId: string;
  isVerified: boolean; // Whether the message signature is valid
}

export class E2EEncryptionService {
  private keyPair: KeyPair | null = null;
  private contactPublicKeys: Map<string, string> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize sodium and load existing key pair from storage
   */
  private async initialize() {
    await initSodium();
    await this.loadKeyPair();
  }

  /**
   * Generate a new key pair for the current user
   */
  async generateKeyPair(): Promise<KeyPair> {
    await initSodium();
    
    const keyPair = sodium.crypto_box_keypair();
    
    const newKeyPair: KeyPair = {
      publicKey: to_base64(keyPair.publicKey),
      privateKey: to_base64(keyPair.privateKey)
    };

    this.keyPair = newKeyPair;
    await this.storeKeyPair(newKeyPair);
    
    return newKeyPair;
  }

  /**
   * Get the current user's public key
   */
  async getPublicKey(): Promise<string | null> {
    await this.initialize();
    return this.keyPair?.publicKey || null;
  }

  /**
   * Store a contact's public key
   */
  async storeContactPublicKey(userId: string, publicKey: string): Promise<void> {
    this.contactPublicKeys.set(userId, publicKey);
    
    // Store in localStorage for persistence
    const storedKeys = this.getStoredContactKeys();
    storedKeys[userId] = publicKey;
    localStorage.setItem('e2e_contact_keys', JSON.stringify(storedKeys));
  }

  /**
   * Get a contact's public key
   */
  async getContactPublicKey(userId: string): Promise<string | null> {
    // Check memory cache first
    if (this.contactPublicKeys.has(userId)) {
      return this.contactPublicKeys.get(userId)!;
    }

    // Load from localStorage
    const storedKeys = this.getStoredContactKeys();
    if (storedKeys[userId]) {
      this.contactPublicKeys.set(userId, storedKeys[userId]);
      return storedKeys[userId];
    }

    return null;
  }

  /**
   * Encrypt a message for a specific recipient
   */
  async encryptMessage(
    content: string, 
    recipientUserId: string, 
    messageId: string
  ): Promise<EncryptedMessage> {
    await this.initialize();
    
    if (!this.keyPair) {
      throw new Error('No key pair available. Generate keys first.');
    }

    const recipientPublicKey = await this.getContactPublicKey(recipientUserId);
    if (!recipientPublicKey) {
      throw new Error(`No public key found for recipient: ${recipientUserId}`);
    }

    // Generate a random nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    
    // Convert keys from base64
    const privateKey = from_base64(this.keyPair.privateKey);
    const publicKey = from_base64(recipientPublicKey);

    // Encrypt the message
    const messageBytes = sodium.from_string(content);
    const encryptedBytes = sodium.crypto_box_easy(messageBytes, nonce, publicKey, privateKey);

    return {
      encryptedContent: to_base64(encryptedBytes),
      nonce: to_base64(nonce),
      senderPublicKey: this.keyPair.publicKey,
      timestamp: Date.now(),
      messageId
    };
  }

  /**
   * Decrypt a message from a sender
   */
  async decryptMessage(
    encryptedMessage: EncryptedMessage,
    senderUserId: string
  ): Promise<DecryptedMessage> {
    await this.initialize();
    
    if (!this.keyPair) {
      throw new Error('No key pair available. Generate keys first.');
    }

    // Verify the sender's public key matches our stored key
    const storedSenderKey = await this.getContactPublicKey(senderUserId);
    const isVerified = storedSenderKey === encryptedMessage.senderPublicKey;

    // Convert from base64
    const encryptedBytes = from_base64(encryptedMessage.encryptedContent);
    const nonce = from_base64(encryptedMessage.nonce);
    const senderPublicKey = from_base64(encryptedMessage.senderPublicKey);
    const privateKey = from_base64(this.keyPair.privateKey);

    try {
      // Decrypt the message
      const decryptedBytes = sodium.crypto_box_open_easy(
        encryptedBytes,
        nonce,
        senderPublicKey,
        privateKey
      );

      const content = sodium.to_string(decryptedBytes);

      return {
        content,
        senderPublicKey: encryptedMessage.senderPublicKey,
        timestamp: encryptedMessage.timestamp,
        messageId: encryptedMessage.messageId,
        isVerified
      };
    } catch (error) {
      throw new Error('Failed to decrypt message. Message may be corrupted or keys may be invalid.');
    }
  }

  /**
   * Verify if encryption is available for a contact
   */
  async canEncryptTo(userId: string): Promise<boolean> {
    const contactKey = await this.getContactPublicKey(userId);
    return contactKey !== null && this.keyPair !== null;
  }

  /**
   * Get encryption status for current user
   */
  async getEncryptionStatus(): Promise<{
    hasKeys: boolean;
    publicKey: string | null;
    contactsWithKeys: number;
  }> {
    await this.initialize();
    
    return {
      hasKeys: this.keyPair !== null,
      publicKey: this.keyPair?.publicKey || null,
      contactsWithKeys: this.contactPublicKeys.size
    };
  }

  /**
   * Exchange public keys with another user (simulate key exchange)
   */
  async initiateKeyExchange(otherUserId: string): Promise<{
    myPublicKey: string;
    exchangeId: string;
  }> {
    await this.initialize();
    
    if (!this.keyPair) {
      await this.generateKeyPair();
    }

    const exchangeId = `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      myPublicKey: this.keyPair!.publicKey,
      exchangeId
    };
  }

  /**
   * Complete key exchange with received public key
   */
  async completeKeyExchange(
    otherUserId: string,
    otherPublicKey: string,
    exchangeId: string
  ): Promise<boolean> {
    try {
      // Validate the public key format
      const keyBytes = from_base64(otherPublicKey);
      if (keyBytes.length !== sodium.crypto_box_PUBLICKEYBYTES) {
        throw new Error('Invalid public key length');
      }

      await this.storeContactPublicKey(otherUserId, otherPublicKey);
      return true;
    } catch (error) {
      console.error('Key exchange failed:', error);
      return false;
    }
  }

  /**
   * Remove a contact's public key (revoke encryption)
   */
  async removeContactKey(userId: string): Promise<void> {
    this.contactPublicKeys.delete(userId);
    
    const storedKeys = this.getStoredContactKeys();
    delete storedKeys[userId];
    localStorage.setItem('e2e_contact_keys', JSON.stringify(storedKeys));
  }

  /**
   * Clear all encryption data (for logout/reset)
   */
  async clearAllKeys(): Promise<void> {
    this.keyPair = null;
    this.contactPublicKeys.clear();
    localStorage.removeItem('e2e_keypair');
    localStorage.removeItem('e2e_contact_keys');
  }

  /**
   * Store key pair in secure local storage
   */
  private async storeKeyPair(keyPair: KeyPair): Promise<void> {
    // In a production environment, consider additional encryption for private keys
    // or use more secure storage like IndexedDB with encryption
    localStorage.setItem('e2e_keypair', JSON.stringify(keyPair));
  }

  /**
   * Load key pair from local storage
   */
  private async loadKeyPair(): Promise<void> {
    try {
      const stored = localStorage.getItem('e2e_keypair');
      if (stored) {
        this.keyPair = JSON.parse(stored);
      }

      // Load contact keys
      const contactKeys = this.getStoredContactKeys();
      for (const [userId, publicKey] of Object.entries(contactKeys)) {
        this.contactPublicKeys.set(userId, publicKey);
      }
    } catch (error) {
      console.error('Failed to load stored keys:', error);
    }
  }

  /**
   * Get stored contact keys from localStorage
   */
  private getStoredContactKeys(): { [userId: string]: string } {
    try {
      const stored = localStorage.getItem('e2e_contact_keys');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load contact keys:', error);
      return {};
    }
  }
}

// Export singleton instance
export const encryptionService = new E2EEncryptionService();

// Utility functions for message validation
export const validateEncryptedMessage = (message: any): message is EncryptedMessage => {
  return (
    typeof message === 'object' &&
    typeof message.encryptedContent === 'string' &&
    typeof message.nonce === 'string' &&
    typeof message.senderPublicKey === 'string' &&
    typeof message.timestamp === 'number' &&
    typeof message.messageId === 'string'
  );
};

export const validateKeyPair = (keyPair: any): keyPair is KeyPair => {
  return (
    typeof keyPair === 'object' &&
    typeof keyPair.publicKey === 'string' &&
    typeof keyPair.privateKey === 'string'
  );
};

export default E2EEncryptionService;