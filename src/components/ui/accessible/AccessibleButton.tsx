/**
 * Accessible Button Component
 * 
 * WCAG 2.1 AA compliant button with full keyboard and screen reader support
 */

'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useEnterSpaceActivation } from '@/lib/accessibility/keyboard-navigation';
import { useNavigationAnnouncements } from '@/lib/accessibility/screen-reader';

const buttonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // High contrast mode support
    'border border-transparent contrast-more:border-current',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-blue-600 text-white hover:bg-blue-700',
          'focus:ring-blue-500',
          'contrast-more:bg-blue-800 contrast-more:text-white',
        ],
        secondary: [
          'bg-gray-100 text-gray-900 hover:bg-gray-200',
          'focus:ring-gray-500',
          'contrast-more:bg-gray-200 contrast-more:text-black',
        ],
        destructive: [
          'bg-red-600 text-white hover:bg-red-700',
          'focus:ring-red-500',
          'contrast-more:bg-red-800 contrast-more:text-white',
        ],
        outline: [
          'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50',
          'focus:ring-gray-500',
          'contrast-more:border-black contrast-more:text-black',
        ],
        ghost: [
          'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          'focus:ring-gray-500',
          'contrast-more:text-black contrast-more:hover:bg-gray-200',
        ],
        link: [
          'bg-transparent text-blue-600 underline-offset-4 hover:underline',
          'focus:ring-blue-500',
          'contrast-more:text-blue-800',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface AccessibleButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Button content */
  children?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Icon to display (for icon buttons) */
  icon?: ReactNode;
  /** Accessible label for icon-only buttons */
  'aria-label'?: string;
  /** Description for complex buttons */
  'aria-describedby'?: string;
  /** Pressed state for toggle buttons */
  'aria-pressed'?: boolean;
  /** Expanded state for dropdown/collapsible buttons */
  'aria-expanded'?: boolean;
  /** Controls attribute for buttons that control other elements */
  'aria-controls'?: string;
  /** Custom announcement when button is activated */
  announcement?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className = '',
    variant,
    size,
    children,
    loading = false,
    icon,
    disabled = false,
    onClick,
    announcement,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    ...props
  }, ref) => {
    const { announceSuccess } = useNavigationAnnouncements();

    // Handle click with announcement
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      
      onClick?.(event);
      
      if (announcement) {
        announceSuccess(announcement);
      }
    };

    // Keyboard activation handler
    const handleKeyDown = useEnterSpaceActivation(() => {
      if (loading || disabled) return;
      
      const syntheticEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }) as any;
      
      handleClick(syntheticEvent);
    });

    const isIconOnly = size === 'icon' || (!children && icon);

    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || (isIconOnly ? 'Icon button' : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {icon && !loading && (
          <span className={children ? 'mr-2' : ''} aria-hidden="true">
            {icon}
          </span>
        )}
        
        {children}
        
        {loading && (
          <span className="sr-only">Loading...</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Specific button variants for common use cases

export const PrimaryButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (props, ref) => (
    <AccessibleButton ref={ref} variant="primary" {...props} />
  )
);

export const SecondaryButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (props, ref) => (
    <AccessibleButton ref={ref} variant="secondary" {...props} />
  )
);

export const DestructiveButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (props, ref) => (
    <AccessibleButton ref={ref} variant="destructive" {...props} />
  )
);

export const IconButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (props, ref) => (
    <AccessibleButton ref={ref} size="icon" {...props} />
  )
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DestructiveButton.displayName = 'DestructiveButton';
IconButton.displayName = 'IconButton';