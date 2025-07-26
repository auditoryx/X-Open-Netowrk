/**
 * AuditoryX Chat Encryption Module
 * 
 * Provides end-to-end encryption for chat messages with perfect forward secrecy
 * and secure key exchange protocols.
 */

// Core encryption functionality
export {
  WebChatEncryption,
  chatEncryption,
  encryptChatMessage,
  decryptChatMessage,
  generateChatKeyPair,
  isEncryptionSupported,
  type KeyPair,
  type EncryptedMessage,
  type DecryptedMessage,
  type ChatKeyManager,
} from './e2e-chat';

// Key exchange and management
export {
  keyExchange,
  initializeChatEncryption,
  getChatEncryptionContext,
  rotateChatKeys,
  type UserKeyData,
  type KeyExchangeSession,
} from './key-exchange';

// Version and metadata
export const ENCRYPTION_VERSION = '1.0.0';
export const ENCRYPTION_ALGORITHM = 'ECDH-P256-AES-GCM';

/**
 * Initialize chat encryption for the current user
 * 
 * @param userId - The user ID to initialize encryption for
 * @returns Promise<boolean> - True if initialization successful
 */
export const initializeUserEncryption = async (userId: string): Promise<boolean> => {
  try {
    return await initializeChatEncryption(userId);
  } catch (error) {
    console.error('Failed to initialize user encryption:', error);
    return false;
  }
};

/**
 * Check if the current environment supports end-to-end encryption
 * 
 * @returns boolean - True if encryption is supported
 */
export const checkEncryptionSupport = (): boolean => {
  return isEncryptionSupported();
};

/**
 * Get encryption status for the current environment
 */
export const getEncryptionStatus = () => {
  const supported = checkEncryptionSupport();
  
  return {
    supported,
    algorithm: supported ? ENCRYPTION_ALGORITHM : null,
    version: ENCRYPTION_VERSION,
    features: {
      perfectForwardSecrecy: supported,
      keyRotation: supported,
      messageAuthentication: supported,
      clientSideEncryption: supported,
    },
  };
};

/**
 * Constants for encryption configuration
 */
export const ENCRYPTION_CONFIG = {
  KEY_ROTATION_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  MAX_MESSAGE_SIZE: 2000, // Maximum message size in characters
  NONCE_SIZE: 12, // AES-GCM nonce size in bytes
  KEY_SIZE: 32, // AES key size in bytes
  PUBLIC_KEY_SIZE: 65, // P-256 uncompressed public key size
  PRIVATE_KEY_SIZE: 32, // P-256 private key size
} as const;