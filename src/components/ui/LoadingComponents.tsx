import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

/**
 * Reusable loading spinner component
 */
export function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`
        animate-spin border-2 rounded-full
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        ${className}
      `}
      aria-label="Loading"
      role="status"
    />
  );
}

/**
 * Skeleton loading placeholder
 */
export function LoadingSkeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  rounded = false 
}: LoadingSkeletonProps) {
  return (
    <div 
      className={`
        animate-pulse bg-gray-200 
        ${rounded ? 'rounded-full' : 'rounded'} 
        ${className}
      `}
      style={{ width, height }}
      aria-label="Loading content"
    />
  );
}

/**
 * Loading button with spinner
 */
export function LoadingButton({
  isLoading,
  children,
  loadingText = 'Loading...',
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative flex items-center justify-center
        ${isLoading ? 'cursor-not-allowed opacity-75' : ''} 
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" color="white" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...' 
}: { 
  isVisible: boolean; 
  message?: string; 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
}

/**
 * Card skeleton for loading states
 */
export function LoadingCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <LoadingSkeleton height="1.5rem" width="70%" />
      <LoadingSkeleton height="1rem" width="100%" />
      <LoadingSkeleton height="1rem" width="80%" />
      <div className="flex space-x-2 mt-4">
        <LoadingSkeleton height="2rem" width="4rem" rounded />
        <LoadingSkeleton height="2rem" width="4rem" rounded />
      </div>
    </div>
  );
}

/**
 * List skeleton for loading states
 */
export function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <LoadingSkeleton width="3rem" height="3rem" rounded />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton height="1rem" width="60%" />
            <LoadingSkeleton height="0.75rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton for loading states
 */
export function LoadingTable({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number; 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-2">
                <LoadingSkeleton height="1rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-2">
                  <LoadingSkeleton height="0.75rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Dashboard stats skeleton
 */
export function LoadingStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-4">
          <LoadingSkeleton height="1rem" width="50%" className="mb-2" />
          <LoadingSkeleton height="2rem" width="70%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Page loading state
 */
export function LoadingPage({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Form loading state
 */
export function LoadingForm() {
  return (
    <div className="space-y-4">
      <div>
        <LoadingSkeleton height="1rem" width="25%" className="mb-2" />
        <LoadingSkeleton height="2.5rem" />
      </div>
      <div>
        <LoadingSkeleton height="1rem" width="30%" className="mb-2" />
        <LoadingSkeleton height="2.5rem" />
      </div>
      <div>
        <LoadingSkeleton height="1rem" width="20%" className="mb-2" />
        <LoadingSkeleton height="6rem" />
      </div>
      <LoadingSkeleton height="2.5rem" width="30%" />
    </div>
  );
}

/**
 * Empty state with loading option
 */
export function EmptyState({ 
  isLoading = false,
  title = 'No data found',
  description = 'There\'s nothing to show here yet.',
  action
}: {
  isLoading?: boolean;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
}

/**
 * Hook for managing loading states
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
}