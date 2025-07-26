/**
 * Chat Components Index
 * 
 * Exports all chat-related components including encrypted chat functionality
 */

// Enhanced chat components with encryption
export { default as EncryptedChatThread } from './EncryptedChatThread';
export { default as SecurityIndicator } from './SecurityIndicator';

// Existing chat components
export { default as EnhancedChatThread } from './EnhancedChatThread';
export { default as PresenceIndicator } from './PresenceIndicator';
export { default as TypingIndicator } from './TypingIndicator';

// Export types for TypeScript support
export type {
  SecurityIndicatorProps,
} from './SecurityIndicator';

// Re-export encryption utilities for convenience
export {
  checkEncryptionSupport,
  getEncryptionStatus,
  ENCRYPTION_CONFIG,
} from '@/lib/encryption';