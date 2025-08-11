/**
 * ARIA Helpers for Accessibility
 * 
 * Utility functions to enhance accessibility across the platform
 * following WCAG 2.1 AA guidelines
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ARIA live region types
export type AriaLiveRegion = 'polite' | 'assertive' | 'off';

// Screen reader announcement utility
export const announceToScreenReader = (message: string, priority: AriaLiveRegion = 'polite') => {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is read
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

// Hook for accessible form error announcements
export const useAccessibleForm = () => {
  const announceError = useCallback((message: string) => {
    announceToScreenReader(`Error: ${message}`, 'assertive');
  }, []);

  const announceSuccess = useCallback((message: string) => {
    announceToScreenReader(`Success: ${message}`, 'polite');
  }, []);

  return { announceError, announceSuccess };
};

// Hook for focus management
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);

  const setFocus = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    
    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return { focusRef, setFocus, trapFocus };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const handleEnterAsClick = useCallback((e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }, []);

  const handleEscapeKey = useCallback((e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  }, []);

  const handleArrowNavigation = useCallback((
    e: KeyboardEvent, 
    items: NodeListOf<Element>, 
    currentIndex: number,
    setCurrentIndex: (index: number) => void
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(nextIndex);
      (items[nextIndex] as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      setCurrentIndex(prevIndex);
      (items[prevIndex] as HTMLElement).focus();
    }
  }, []);

  return { handleEnterAsClick, handleEscapeKey, handleArrowNavigation };
};

// ARIA attributes helpers
export const getAriaAttributes = {
  button: (pressed?: boolean, expanded?: boolean, controls?: string) => ({
    role: 'button',
    tabIndex: 0,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
    'aria-controls': controls,
  }),
  
  link: (current?: boolean) => ({
    role: SCHEMA_FIELDS.NOTIFICATION.LINK,
    'aria-current': current ? 'page' : undefined,
  }),
  
  heading: (level: 1 | 2 | 3 | 4 | 5 | 6) => ({
    role: 'heading',
    'aria-level': level,
  }),
  
  form: (labelledBy?: string, describedBy?: string) => ({
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),
  
  input: (labelledBy?: string, describedBy?: string, invalid?: boolean, required?: boolean) => ({
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    'aria-required': required,
  }),
  
  dialog: (labelledBy?: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),
  
  list: (setSize?: number, posInSet?: number) => ({
    role: 'list',
    'aria-setsize': setSize,
    'aria-posinset': posInSet,
  }),
  
  listItem: () => ({
    role: 'listitem',
  }),
  
  status: (live: AriaLiveRegion = 'polite') => ({
    role: SCHEMA_FIELDS.BOOKING.STATUS,
    'aria-live': live,
    'aria-atomic': true,
  }),
  
  alert: () => ({
    role: 'alert',
    'aria-live': 'assertive' as AriaLiveRegion,
    'aria-atomic': true,
  }),
};

// Color contrast validation
export const validateColorContrast = (foreground: string, background: string): boolean => {
  // Simple implementation - in production, use a proper color contrast library
  // This is a placeholder that always returns true for now
  // TODO: Implement actual color contrast calculation
  return true;
};

// Skip link component helper
export const createSkipLink = (targetId: string, text: string) => ({
  href: `#${targetId}`,
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50',
  children: text,
});

// Screen reader only class
export const srOnly = 'sr-only';

// Focus visible utilities
export const focusVisible = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};