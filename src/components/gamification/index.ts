// Phase 1B: Basic XP Display Components
export { default as XPDisplay } from './XPDisplay';
export { default as XPProgressBar } from './XPProgressBar';
export { default as XPWidget } from './XPWidget';
export { default as XPNotificationSystem, useXPNotifications } from './XPNotificationSystem';

// Re-export types for convenience
export type { 
  XPNotification 
} from './XPNotificationSystem';
