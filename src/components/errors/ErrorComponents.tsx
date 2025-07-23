'use client';

import React from 'react';
import { AppError, ErrorAction, ErrorHandler } from '@/lib/errors/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

interface ErrorPageProps {
  error: any;
  reset?: () => void;
}

interface ErrorToastProps {
  error: any;
  onDismiss: () => void;
  duration?: number;
}

/**
 * Inline error display component
 */
export function ErrorDisplay({ error, onRetry, onDismiss, className = '' }: ErrorDisplayProps) {
  const appError = ErrorHandler.handleError(error);
  const actions = ErrorHandler.getErrorActions(appError);

  // Add custom retry action if provided
  if (onRetry && appError.retryable) {
    actions.unshift({ label: 'Retry', action: onRetry, primary: true });
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {getErrorTitle(appError.category)}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{appError.userMessage}</p>
          </div>
          {actions.length > 0 && (
            <div className="mt-4 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`text-sm font-medium ${
                    action.primary
                      ? 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700'
                      : 'text-red-600 hover:text-red-500 underline'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Full page error component
 */
export function ErrorPage({ error, reset }: ErrorPageProps) {
  const appError = ErrorHandler.handleError(error);
  const actions = ErrorHandler.getErrorActions(appError);

  // Add custom reset action if provided
  if (reset && appError.retryable) {
    actions.unshift({ label: 'Try Again', action: reset, primary: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle(appError.category)}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {appError.userMessage}
          </p>
        </div>
        {actions.length > 0 && (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  action.primary
                    ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'text-blue-600 bg-white border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Error code: {appError.code}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast notification for errors
 */
export function ErrorToast({ error, onDismiss, duration = 5000 }: ErrorToastProps) {
  const appError = ErrorHandler.handleError(error);

  React.useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-red-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {getErrorTitle(appError.category)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {appError.userMessage}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing error state
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((rawError: any) => {
    const appError = ErrorHandler.handleError(rawError);
    setError(appError);

    // Log error if it should be reported
    if (ErrorHandler.shouldReport(appError)) {
      console.error('Reportable error:', ErrorHandler.formatForLogging(appError));
      // Here you could send to monitoring service like Sentry
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retryWithError = React.useCallback((retryFn: () => void | Promise<void>) => {
    return async () => {
      try {
        clearError();
        await retryFn();
      } catch (newError) {
        handleError(newError);
      }
    };
  }, [clearError, handleError]);

  return {
    error,
    handleError,
    clearError,
    retryWithError
  };
}

/**
 * Error boundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; reset: () => void }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; reset: () => void }> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handleError(error);
    
    if (ErrorHandler.shouldReport(appError)) {
      console.error('Error boundary caught error:', ErrorHandler.formatForLogging(appError));
      // Here you could send to monitoring service
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={() => this.setState({ hasError: false })} />;
      }

      return <ErrorPage error={this.state.error} reset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// Helper function to get error titles
function getErrorTitle(category: AppError['category']): string {
  switch (category) {
    case 'authentication':
      return 'Authentication Error';
    case 'authorization':
      return 'Access Denied';
    case 'validation':
      return 'Invalid Input';
    case 'network':
      return 'Connection Error';
    case 'payment':
      return 'Payment Error';
    case 'server':
      return 'Server Error';
    default:
      return 'Something Went Wrong';
  }
}