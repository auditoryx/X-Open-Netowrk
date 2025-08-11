/**
 * Accessibility Library Index
 * 
 * Central exports for all accessibility utilities and components
 */

// ARIA and accessibility helpers
export * from './aria-helpers';
export * from './keyboard-navigation';
export * from './screen-reader';

// Re-export common types
export type { AriaLiveRegion } from './aria-helpers';

// Constants
export const ACCESSIBILITY_CONSTANTS = {
  WCAG_LEVELS: {
    A: 'A',
    AA: 'AA',
    AAA: 'AAA',
  },
  COLOR_CONTRAST_RATIOS: {
    NORMAL_AA: 4.5,
    LARGE_AA: 3.0,
    NORMAL_AAA: 7.0,
    LARGE_AAA: 4.5,
  },
  KEYBOARD_KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },
  ARIA_ROLES: {
    ALERT: 'alert',
    BUTTON: 'button',
    DIALOG: 'dialog',
    LISTBOX: 'listbox',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    OPTION: 'option',
    TAB: 'tab',
    TABLIST: 'tablist',
    TABPANEL: 'tabpanel',
  },
} as const;

// Utility functions for common accessibility patterns
export const a11yUtils = {
  // Generate unique IDs for form associations
  generateId: (prefix: string = 'a11y') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if an element is focusable
  isFocusable: (element: Element): boolean => {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return element.matches(focusableSelector) && !element.hasAttribute('disabled');
  },
  
  // Get accessible name for an element
  getAccessibleName: (element: Element): string => {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }
    
    const id = element.getAttribute(SCHEMA_FIELDS.USER.ID);
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || '';
    }
    
    return element.textContent || '';
  },
  
  // Check if reduced motion is preferred
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Check if high contrast is preferred
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return;
    
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  },
};