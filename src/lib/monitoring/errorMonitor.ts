/**
 * Error Monitoring and Logging System
 * Provides structured error handling and reporting
 */

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  route?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private maxStoredErrors = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        new Error(event.message),
        {
          route: window.location.pathname,
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        },
        'high'
      );
    });

    // Handle unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(event.reason),
        {
          route: window.location.pathname,
          additionalData: {
            type: 'unhandledrejection'
          }
        },
        'high'
      );
    });

    // Handle React Error Boundary errors
    window.addEventListener('react-error', (event: any) => {
      this.logError(
        event.detail.error,
        {
          component: event.detail.errorInfo?.componentStack,
          route: window.location.pathname,
          additionalData: event.detail.errorInfo
        },
        'critical'
      );
    });
  }

  logError(
    error: Error, 
    context: ErrorContext = {}, 
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context: {
        route: this.getCurrentRoute(),
        ...context
      },
      severity,
      resolved: false
    };

    // Store error locally (for development and debugging)
    this.storeError(errorReport);

    // Send to external services
    this.sendToExternalServices(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorMonitor]', errorReport);
    }

    return errorReport.id;
  }

  logAuthError(error: Error, context: Omit<ErrorContext, 'action'>) {
    return this.logError(error, { ...context, action: 'authentication' }, 'high');
  }

  logPaymentError(error: Error, context: Omit<ErrorContext, 'action'>) {
    return this.logError(error, { ...context, action: 'payment' }, 'critical');
  }

  logAPIError(error: Error, endpoint: string, context: ErrorContext = {}) {
    return this.logError(
      error, 
      { 
        ...context, 
        action: 'api_call',
        additionalData: { endpoint, ...context.additionalData }
      }, 
      'medium'
    );
  }

  logComponentError(error: Error, componentName: string, context: ErrorContext = {}) {
    return this.logError(
      error,
      {
        ...context,
        component: componentName,
        action: 'component_render'
      },
      'medium'
    );
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentRoute(): string {
    return typeof window !== 'undefined' ? window.location.pathname : 'unknown';
  }

  private storeError(error: ErrorReport) {
    this.errors.unshift(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors);
    }

    // Store in localStorage for persistence across sessions
    try {
      if (typeof window !== 'undefined') {
        const storedErrors = JSON.stringify(this.errors.slice(0, 10)); // Store only 10 most recent
        localStorage.setItem('x_open_network_errors', storedErrors);
      }
    } catch (e) {
      // localStorage might be full or unavailable
      console.warn('Could not store errors in localStorage:', e);
    }
  }

  private sendToExternalServices(error: ErrorReport) {
    // Send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message), {
        tags: {
          severity: error.severity,
          route: error.context.route,
          component: error.context.component,
          action: error.context.action
        },
        user: {
          id: error.context.userId,
          role: error.context.userRole
        },
        extra: error.context.additionalData
      });
    }

    // Send to custom analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: error.severity === 'critical',
        custom_map: {
          error_id: error.id,
          error_context: JSON.stringify(error.context)
        }
      });
    }

    // Send to backend logging service (if available)
    this.sendToBackendLogger(error);
  }

  private async sendToBackendLogger(error: ErrorReport) {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/monitoring/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error)
        });
      }
    } catch (e) {
      // Silently fail - don't want error logging to cause more errors
      console.warn('Failed to send error to backend logger:', e);
    }
  }

  // Get errors for debugging/admin purposes
  getErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  // Get errors by severity
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Get unresolved errors
  getUnresolvedErrors(): ErrorReport[] {
    return this.errors.filter(error => !error.resolved);
  }

  // Mark error as resolved
  markErrorResolved(errorId: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.storeError(error); // Update storage
    }
  }

  // Clear old errors
  clearOldErrors(olderThanDays = 7) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    this.errors = this.errors.filter(error => error.timestamp > cutoffTime);
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const recent = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    
    return {
      total: this.errors.length,
      byType: this.errors.reduce((acc, error) => {
        const type = error.context.action || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: this.errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentErrors: this.errors.filter(error => error.timestamp > recent).length
    };
  }
}

// Global instance
export const errorMonitor = new ErrorMonitor();

// React Error Boundary hook
export function useErrorBoundary() {
  return {
    logError: (error: Error, errorInfo?: any) => {
      errorMonitor.logComponentError(error, 'ErrorBoundary', {
        additionalData: errorInfo
      });
    }
  };
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    errorMonitor.logError(error as Error, context);
    return null;
  }
}

// Function wrapper with error handling
export function withErrorHandlingSync<T>(
  operation: () => T,
  context: ErrorContext = {}
): T | null {
  try {
    return operation();
  } catch (error) {
    errorMonitor.logError(error as Error, context);
    return null;
  }
}