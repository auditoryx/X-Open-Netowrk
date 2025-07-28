/**
 * Focus Manager Component
 * 
 * Comprehensive focus management for modals, dropdowns, and complex interactions
 */

'use client';

import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { useFocusTrap, useEscapeKey } from '@/lib/accessibility/keyboard-navigation';
import { useFocusRestore } from '@/lib/accessibility/keyboard-navigation';

export interface FocusManagerProps {
  /** Child elements to manage focus within */
  children: ReactNode;
  /** Whether focus management is active */
  enabled?: boolean;
  /** Whether to trap focus within the container */
  trapFocus?: boolean;
  /** Whether to restore focus when disabled */
  restoreFocus?: boolean;
  /** Whether to auto-focus the first element */
  autoFocus?: boolean;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Custom selector for focusable elements */
  focusableSelector?: string;
  /** Element to focus initially (overrides autoFocus) */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Element to focus when trap is disabled */
  finalFocusRef?: React.RefObject<HTMLElement>;
  /** Additional class names */
  className?: string;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  enabled = true,
  trapFocus = false,
  restoreFocus = false,
  autoFocus = false,
  onEscape,
  focusableSelector,
  initialFocusRef,
  finalFocusRef,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { previousActiveElement, restoreFocus: performFocusRestore } = useFocusRestore();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Enable focus trap
  useFocusTrap(enabled && trapFocus, containerRef);

  // Handle escape key
  useEscapeKey(() => {
    onEscape?.();
  }, enabled && !!onEscape);

  // Store previous focus when enabled
  useEffect(() => {
    if (enabled && restoreFocus) {
      previousFocusRef.current = previousActiveElement();
    }
  }, [enabled, restoreFocus, previousActiveElement]);

  // Handle initial focus
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Focus initial element
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (autoFocus) {
      const selector = focusableSelector || 
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      
      const firstFocusable = containerRef.current.querySelector(selector) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [enabled, autoFocus, focusableSelector, initialFocusRef]);

  // Handle focus restoration when disabled
  useEffect(() => {
    if (!enabled && restoreFocus) {
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus();
      } else if (previousFocusRef.current) {
        performFocusRestore(previousFocusRef.current);
      }
    }
  }, [enabled, restoreFocus, finalFocusRef, performFocusRestore]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Modal focus manager - specialized for modal dialogs
export interface ModalFocusManagerProps extends Omit<FocusManagerProps, 'trapFocus' | 'restoreFocus'> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose?: () => void;
}

export const ModalFocusManager: React.FC<ModalFocusManagerProps> = ({
  isOpen,
  onClose,
  children,
  ...props
}) => {
  return (
    <FocusManager
      enabled={isOpen}
      trapFocus={true}
      restoreFocus={true}
      autoFocus={true}
      onEscape={onClose}
      {...props}
    >
      {children}
    </FocusManager>
  );
};

// Dropdown focus manager - specialized for dropdown menus
export interface DropdownFocusManagerProps extends Omit<FocusManagerProps, 'trapFocus'> {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback when dropdown should close */
  onClose?: () => void;
  /** Reference to the trigger element */
  triggerRef?: React.RefObject<HTMLElement>;
}

export const DropdownFocusManager: React.FC<DropdownFocusManagerProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  restoreFocus = true,
  ...props
}) => {
  return (
    <FocusManager
      enabled={isOpen}
      trapFocus={false}
      restoreFocus={restoreFocus}
      autoFocus={true}
      onEscape={onClose}
      finalFocusRef={triggerRef}
      {...props}
    >
      {children}
    </FocusManager>
  );
};

// Skip links component
export interface SkipLinksProps {
  /** Array of skip link targets */
  links?: Array<{
    href: string;
    text: string;
  }>;
  /** Additional class names */
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' },
  ],
  className = '',
}) => {
  return (
    <div className={`sr-only focus-within:not-sr-only ${className}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="
            absolute left-0 top-0 z-50 bg-blue-600 text-white px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600
            transform -translate-y-full focus:translate-y-0 transition-transform
          "
        >
          {link.text}
        </a>
      ))}
    </div>
  );
};

// Focus indicator component - visual focus indication
export interface FocusIndicatorProps {
  /** Whether to show the focus indicator */
  visible?: boolean;
  /** Additional class names */
  className?: string;
  /** Children to wrap */
  children: ReactNode;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  visible = true,
  className = '',
  children,
}) => {
  const indicatorClasses = visible
    ? 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
    : '';

  return (
    <div className={`${indicatorClasses} ${className}`}>
      {children}
    </div>
  );
};

// Roving tabindex container for complex widgets
export interface RovingTabIndexProps {
  /** Children elements that should participate in roving tabindex */
  children: ReactNode;
  /** Orientation of the widget */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Whether the widget is active */
  enabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Callback when active item changes */
  onActiveChange?: (index: number) => void;
}

export const RovingTabIndex: React.FC<RovingTabIndexProps> = ({
  children,
  orientation = 'both',
  enabled = true,
  className = '',
  onActiveChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]')
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    let newIndex = activeIndex;

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = (activeIndex + 1) % focusableElements.length;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = (activeIndex - 1 + focusableElements.length) % focusableElements.length;
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = (activeIndex + 1) % focusableElements.length;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = (activeIndex - 1 + focusableElements.length) % focusableElements.length;
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = focusableElements.length - 1;
        break;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      focusableElements[newIndex].focus();
      onActiveChange?.(newIndex);
    }
  }, [activeIndex, enabled, orientation, onActiveChange]);

  // Update tabindex attributes
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]')
    ) as HTMLElement[];

    focusableElements.forEach((element, index) => {
      element.tabIndex = index === activeIndex ? 0 : -1;
    });
  }, [activeIndex, enabled]);

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};