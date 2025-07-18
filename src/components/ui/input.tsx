import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mobileOptimized?: boolean;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mobileOptimized = true, error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base input styles
          'flex w-full rounded-lg border bg-white px-3 py-2.5 text-base',
          'transition-colors duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          
          // Mobile optimizations
          mobileOptimized && [
            'mobile:px-4 mobile:py-3 mobile:text-base', // Larger touch targets on mobile
            'mobile:rounded-xl', // More rounded corners on mobile
            'touch-manipulation', // Better touch handling
          ],
          
          // State styles
          error ? [
            'border-red-300 focus:border-red-500 focus:ring-red-500',
            'dark:border-red-600 dark:focus:border-red-500'
          ] : [
            'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
            'dark:border-gray-600 dark:focus:border-brand-400'
          ],
          
          // Dark mode
          'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";