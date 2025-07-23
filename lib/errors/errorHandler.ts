export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  category: 'validation' | 'authentication' | 'authorization' | 'network' | 'server' | 'payment' | 'unknown';
  context?: Record<string, any>;
}

export interface ErrorAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

/**
 * Comprehensive error handling utility for user-friendly error messages
 */
export class ErrorHandler {
  private static errorMappings: Record<string, Partial<AppError>> = {
    // Firebase Auth Errors
    'auth/user-not-found': {
      userMessage: 'No account found with this email address. Please check your email or sign up for a new account.',
      category: 'authentication',
      retryable: false
    },
    'auth/wrong-password': {
      userMessage: 'Incorrect password. Please check your password and try again.',
      category: 'authentication',
      retryable: true
    },
    'auth/invalid-email': {
      userMessage: 'Please enter a valid email address.',
      category: 'validation',
      retryable: true
    },
    'auth/user-disabled': {
      userMessage: 'This account has been disabled. Please contact support for assistance.',
      category: 'authorization',
      retryable: false
    },
    'auth/too-many-requests': {
      userMessage: 'Too many failed attempts. Please wait a few minutes before trying again.',
      category: 'authentication',
      retryable: true
    },
    'auth/email-already-in-use': {
      userMessage: 'An account with this email already exists. Please sign in instead.',
      category: 'authentication',
      retryable: false
    },
    'auth/weak-password': {
      userMessage: 'Password is too weak. Please choose a stronger password with at least 8 characters.',
      category: 'validation',
      retryable: true
    },
    'auth/requires-recent-login': {
      userMessage: 'For security, please sign in again before making this change.',
      category: 'authentication',
      retryable: true
    },
    'auth/expired-action-code': {
      userMessage: 'This link has expired. Please request a new one.',
      category: 'authentication',
      retryable: true
    },
    'auth/invalid-action-code': {
      userMessage: 'This link is invalid or has already been used. Please request a new one.',
      category: 'authentication',
      retryable: true
    },

    // Firestore Errors
    'permission-denied': {
      userMessage: 'You do not have permission to perform this action.',
      category: 'authorization',
      retryable: false
    },
    'not-found': {
      userMessage: 'The requested information could not be found.',
      category: 'server',
      retryable: false
    },
    'already-exists': {
      userMessage: 'This information already exists. Please check and try again.',
      category: 'validation',
      retryable: false
    },
    'resource-exhausted': {
      userMessage: 'Service is temporarily overloaded. Please try again in a few minutes.',
      category: 'server',
      retryable: true
    },
    'failed-precondition': {
      userMessage: 'Cannot complete this action due to current conditions. Please refresh and try again.',
      category: 'validation',
      retryable: true
    },
    'aborted': {
      userMessage: 'Operation was interrupted. Please try again.',
      category: 'server',
      retryable: true
    },
    'out-of-range': {
      userMessage: 'Invalid input values. Please check your data and try again.',
      category: 'validation',
      retryable: true
    },
    'unauthenticated': {
      userMessage: 'Please sign in to continue.',
      category: 'authentication',
      retryable: true
    },
    'deadline-exceeded': {
      userMessage: 'Request timed out. Please check your connection and try again.',
      category: 'network',
      retryable: true
    },
    'unavailable': {
      userMessage: 'Service is temporarily unavailable. Please try again later.',
      category: 'server',
      retryable: true
    },

    // Network Errors
    'NetworkError': {
      userMessage: 'Network error. Please check your internet connection and try again.',
      category: 'network',
      retryable: true
    },
    'TimeoutError': {
      userMessage: 'Request timed out. Please try again.',
      category: 'network',
      retryable: true
    },

    // Validation Errors
    'ValidationError': {
      userMessage: 'Please check your input and try again.',
      category: 'validation',
      retryable: true
    },
    'InvalidInput': {
      userMessage: 'Please provide valid information for all required fields.',
      category: 'validation',
      retryable: true
    },

    // File Upload Errors
    'file-too-large': {
      userMessage: 'File is too large. Please choose a file smaller than 10MB.',
      category: 'validation',
      retryable: true
    },
    'invalid-file-type': {
      userMessage: 'File type not supported. Please choose a valid image, video, or document file.',
      category: 'validation',
      retryable: true
    },
    'upload-failed': {
      userMessage: 'File upload failed. Please check your connection and try again.',
      category: 'server',
      retryable: true
    },

    // Payment Errors (generic - specific Stripe errors handled separately)
    'payment-failed': {
      userMessage: 'Payment could not be processed. Please try again or use a different payment method.',
      category: 'payment',
      retryable: true
    },
    'payment-required': {
      userMessage: 'Payment is required to complete this action.',
      category: 'payment',
      retryable: false
    }
  };

  /**
   * Convert any error to a user-friendly AppError
   */
  static handleError(error: any): AppError {
    const code = this.extractErrorCode(error);
    const originalMessage = this.extractErrorMessage(error);

    // Check for mapped error
    const mappedError = this.errorMappings[code];
    
    if (mappedError) {
      return {
        code,
        message: originalMessage,
        userMessage: mappedError.userMessage || originalMessage,
        retryable: mappedError.retryable ?? true,
        category: mappedError.category || 'unknown',
        context: error.context
      };
    }

    // Handle unmapped errors
    return this.handleUnmappedError(code, originalMessage, error);
  }

  /**
   * Extract error code from various error types
   */
  private static extractErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.name) return error.name;
    if (error?.type) return error.type;
    if (typeof error === 'string') return error;
    return 'unknown-error';
  }

  /**
   * Extract error message from various error types
   */
  private static extractErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  }

  /**
   * Handle unmapped errors with intelligent categorization
   */
  private static handleUnmappedError(code: string, message: string, error: any): AppError {
    const lowerMessage = message.toLowerCase();
    
    // Network-related errors
    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || 
        lowerMessage.includes('timeout') || lowerMessage.includes('offline')) {
      return {
        code,
        message,
        userMessage: 'Network error. Please check your internet connection and try again.',
        retryable: true,
        category: 'network',
        context: error.context
      };
    }

    // Authentication-related errors
    if (lowerMessage.includes('auth') || lowerMessage.includes('login') || 
        lowerMessage.includes('unauthorized') || lowerMessage.includes('token')) {
      return {
        code,
        message,
        userMessage: 'Authentication error. Please sign in again.',
        retryable: true,
        category: 'authentication',
        context: error.context
      };
    }

    // Validation-related errors
    if (lowerMessage.includes('invalid') || lowerMessage.includes('required') || 
        lowerMessage.includes('format') || lowerMessage.includes('validation')) {
      return {
        code,
        message,
        userMessage: 'Please check your input and try again.',
        retryable: true,
        category: 'validation',
        context: error.context
      };
    }

    // Server-related errors
    if (lowerMessage.includes('server') || lowerMessage.includes('internal') || 
        lowerMessage.includes('500') || lowerMessage.includes('service')) {
      return {
        code,
        message,
        userMessage: 'Server error. Please try again in a few minutes.',
        retryable: true,
        category: 'server',
        context: error.context
      };
    }

    // Default fallback
    return {
      code,
      message,
      userMessage: 'Something went wrong. Please try again.',
      retryable: true,
      category: 'unknown',
      context: error.context
    };
  }

  /**
   * Get suggested actions for an error
   */
  static getErrorActions(appError: AppError): ErrorAction[] {
    const actions: ErrorAction[] = [];

    switch (appError.category) {
      case 'authentication':
        if (appError.code === 'auth/requires-recent-login') {
          actions.push({ label: 'Sign In Again', action: () => window.location.href = '/login', primary: true });
        } else if (appError.retryable) {
          actions.push({ label: 'Try Again', action: () => window.location.reload() });
          actions.push({ label: 'Reset Password', action: () => window.location.href = '/forgot-password' });
        } else {
          actions.push({ label: 'Sign Up', action: () => window.location.href = '/signup', primary: true });
          actions.push({ label: 'Contact Support', action: () => window.location.href = '/contact' });
        }
        break;

      case 'network':
        actions.push({ label: 'Try Again', action: () => window.location.reload(), primary: true });
        actions.push({ label: 'Check Connection', action: () => window.open('https://www.google.com', '_blank') });
        break;

      case 'validation':
        actions.push({ label: 'Fix & Retry', action: () => window.history.back(), primary: true });
        break;

      case 'authorization':
        actions.push({ label: 'Contact Support', action: () => window.location.href = '/contact', primary: true });
        break;

      case 'payment':
        actions.push({ label: 'Try Different Card', action: () => window.history.back(), primary: true });
        actions.push({ label: 'Contact Support', action: () => window.location.href = '/contact' });
        break;

      case 'server':
        if (appError.retryable) {
          actions.push({ label: 'Try Again', action: () => window.location.reload(), primary: true });
          actions.push({ label: 'Try Later', action: () => window.history.back() });
        } else {
          actions.push({ label: 'Contact Support', action: () => window.location.href = '/contact', primary: true });
        }
        break;

      default:
        actions.push({ label: 'Try Again', action: () => window.location.reload(), primary: true });
        actions.push({ label: 'Go Back', action: () => window.history.back() });
        actions.push({ label: 'Contact Support', action: () => window.location.href = '/contact' });
    }

    return actions;
  }

  /**
   * Format error for logging while preserving user privacy
   */
  static formatForLogging(appError: AppError): Record<string, any> {
    return {
      code: appError.code,
      category: appError.category,
      retryable: appError.retryable,
      timestamp: new Date().toISOString(),
      // Don't log the full message to avoid logging sensitive data
      hasContext: !!appError.context
    };
  }

  /**
   * Check if an error should be reported to monitoring services
   */
  static shouldReport(appError: AppError): boolean {
    // Don't report user errors or known validation issues
    if (appError.category === 'validation' || appError.category === 'authentication') {
      return false;
    }

    // Don't report network errors (usually user's connection)
    if (appError.category === 'network') {
      return false;
    }

    // Report server errors and unknown errors
    return appError.category === 'server' || appError.category === 'unknown';
  }
}