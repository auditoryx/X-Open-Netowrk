/**
 * Screen Reader Optimizations
 * 
 * Utilities and components optimized for screen reader accessibility
 */

import { useEffect, useState, useRef, useCallback } from 'react';

// Screen reader detection
export const useScreenReaderDetection = () => {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Detect screen readers by checking for common patterns
    const detectScreenReader = () => {
      // Check for reduced motion preference (often used by screen reader users)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for Windows High Contrast mode
      const highContrast = window.matchMedia('(-ms-high-contrast: active)').matches;
      
      // Check navigator properties
      const hasScreenReader = !!(window as any).speechSynthesis || 
                              navigator.userAgent.includes('NVDA') ||
                              navigator.userAgent.includes('JAWS') ||
                              navigator.userAgent.includes('SARA');

      setIsScreenReader(prefersReducedMotion || highContrast || hasScreenReader);
    };

    detectScreenReader();

    // Listen for changes in media queries
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(-ms-high-contrast: active)');

    reducedMotionQuery.addEventListener('change', detectScreenReader);
    highContrastQuery.addEventListener('change', detectScreenReader);

    return () => {
      reducedMotionQuery.removeEventListener('change', detectScreenReader);
      highContrastQuery.removeEventListener('change', detectScreenReader);
    };
  }, []);

  return isScreenReader;
};

// Live region announcer
export const useLiveRegion = () => {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = priority === 'assertive' ? assertiveRef.current : politeRef.current;
    
    if (region) {
      // Clear and then set to ensure screen readers notice the change
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      
      // Clear after announcement to prevent repetition
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }, []);

  // Create live region elements
  useEffect(() => {
    if (!politeRef.current) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      politeRegion.id = 'live-region-polite';
      document.body.appendChild(politeRegion);
      politeRef.current = politeRegion;
    }

    if (!assertiveRef.current) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      assertiveRegion.id = 'live-region-assertive';
      document.body.appendChild(assertiveRegion);
      assertiveRef.current = assertiveRegion;
    }

    return () => {
      if (politeRef.current && document.body.contains(politeRef.current)) {
        document.body.removeChild(politeRef.current);
      }
      if (assertiveRef.current && document.body.contains(assertiveRef.current)) {
        document.body.removeChild(assertiveRef.current);
      }
    };
  }, []);

  return { announce };
};

// Reading order optimization
export const useReadingOrder = () => {
  const ensureReadingOrder = useCallback((container: HTMLElement) => {
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach((element, index) => {
      if (!element.hasAttribute('tabindex') || element.getAttribute('tabindex') === '0') {
        element.setAttribute('tabindex', '0');
      }
    });
  }, []);

  return { ensureReadingOrder };
};

// Screen reader specific content
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

// Descriptive text for complex UI elements
export const useDescriptiveText = () => {
  const generateDescription = useCallback((element: {
    type: 'button' | 'link' | 'form' | 'dialog' | 'menu' | 'table';
    action?: string;
    state?: string;
    context?: string;
    position?: { current: number; total: number };
  }) => {
    const { type, action, state, context, position } = element;

    let description = '';

    switch (type) {
      case 'button':
        description = `${action || 'button'}`;
        if (state) description += `, ${state}`;
        break;
      
      case 'link':
        description = `${action || 'link'}`;
        if (context) description += `, ${context}`;
        break;
      
      case 'form':
        description = `${context || 'form'}`;
        if (state) description += `, ${state}`;
        break;
      
      case 'dialog':
        description = `${context || 'dialog'}`;
        break;
      
      case 'menu':
        description = `${context || 'menu'}`;
        if (position) {
          description += `, item ${position.current} of ${position.total}`;
        }
        break;
      
      case 'table':
        description = `${context || 'table'}`;
        if (position) {
          description += `, row ${position.current} of ${position.total}`;
        }
        break;
    }

    return description;
  }, []);

  return { generateDescription };
};

// Enhanced focus announcements
export const useFocusAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceFocus = useCallback((element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute(SCHEMA_FIELDS.USER.ROLE);
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    let announcement = '';

    // Get the accessible name
    if (ariaLabel) {
      announcement = ariaLabel;
    } else if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {
        announcement = labelElement.textContent || '';
      }
    } else {
      announcement = element.textContent || '';
    }

    // Add role or element type
    if (role) {
      announcement += `, ${role}`;
    } else {
      switch (tagName) {
        case 'button':
          announcement += ', button';
          break;
        case 'a':
          announcement += ', link';
          break;
        case 'input':
          const inputType = element.getAttribute(SCHEMA_FIELDS.NOTIFICATION.TYPE) || 'text';
          announcement += `, ${inputType} input`;
          break;
        case 'select':
          announcement += ', dropdown';
          break;
      }
    }

    // Add state information
    const ariaPressed = element.getAttribute('aria-pressed');
    const ariaExpanded = element.getAttribute('aria-expanded');
    const ariaSelected = element.getAttribute('aria-selected');
    const ariaChecked = element.getAttribute('aria-checked');

    if (ariaPressed) {
      announcement += ariaPressed === 'true' ? ', pressed' : ', not pressed';
    }
    if (ariaExpanded) {
      announcement += ariaExpanded === 'true' ? ', expanded' : ', collapsed';
    }
    if (ariaSelected) {
      announcement += ariaSelected === 'true' ? ', selected' : ', not selected';
    }
    if (ariaChecked) {
      announcement += ariaChecked === 'true' ? ', checked' : ', not checked';
    }

    announce(announcement, 'polite');
  }, [announce]);

  return { announceFocus };
};

// Context announcements for navigation
export const useNavigationAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceNavigation = useCallback((context: {
    from?: string;
    to: string;
    type: 'page' | 'section' | 'modal' | 'menu';
  }) => {
    const { from, to, type } = context;
    
    let announcement = '';
    
    switch (type) {
      case 'page':
        announcement = `Navigated to ${to} page`;
        break;
      case 'section':
        announcement = `Moved to ${to} section`;
        break;
      case 'modal':
        announcement = `Opened ${to} dialog`;
        break;
      case 'menu':
        announcement = `Opened ${to} menu`;
        break;
    }

    announce(announcement, 'polite');
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    if (isLoading) {
      announce(`Loading${context ? ` ${context}` : ''}...`, 'polite');
    } else {
      announce(`Finished loading${context ? ` ${context}` : ''}`, 'polite');
    }
  }, [announce]);

  return { 
    announceNavigation, 
    announceError, 
    announceSuccess, 
    announceLoading 
  };
};

// Progress announcements
export const useProgressAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceProgress = useCallback((progress: {
    current: number;
    total: number;
    context?: string;
    percentage?: boolean;
  }) => {
    const { current, total, context, percentage } = progress;
    
    let announcement = '';
    
    if (percentage) {
      const percent = Math.round((current / total) * 100);
      announcement = `${percent}% complete`;
    } else {
      announcement = `${current} of ${total}`;
    }
    
    if (context) {
      announcement = `${context}: ${announcement}`;
    }

    announce(announcement, 'polite');
  }, [announce]);

  return { announceProgress };
};

// Table navigation announcements
export const useTableAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceTablePosition = useCallback((position: {
    row: number;
    column: number;
    totalRows: number;
    totalColumns: number;
    cellContent: string;
    columnHeader?: string;
    rowHeader?: string;
  }) => {
    const { row, column, totalRows, totalColumns, cellContent, columnHeader, rowHeader } = position;
    
    let announcement = `Row ${row + 1} of ${totalRows}, column ${column + 1} of ${totalColumns}`;
    
    if (columnHeader) {
      announcement += `, ${columnHeader}`;
    }
    
    if (rowHeader) {
      announcement += `, ${rowHeader}`;
    }
    
    announcement += `, ${cellContent}`;

    announce(announcement, 'polite');
  }, [announce]);

  return { announceTablePosition };
};

// Form validation announcements
export const useFormAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceValidation = useCallback((validation: {
    field: string;
    error?: string;
    success?: boolean;
  }) => {
    const { field, error, success } = validation;
    
    if (error) {
      announce(`${field}: ${error}`, 'assertive');
    } else if (success) {
      announce(`${field} is valid`, 'polite');
    }
  }, [announce]);

  const announceFormSubmission = useCallback((status: 'submitting' | 'success' | 'error', message?: string) => {
    switch (status) {
      case 'submitting':
        announce('Submitting form...', 'polite');
        break;
      case 'success':
        announce(`Form submitted successfully${message ? `: ${message}` : ''}`, 'polite');
        break;
      case 'error':
        announce(`Form submission failed${message ? `: ${message}` : ''}`, 'assertive');
        break;
    }
  }, [announce]);

  return { announceValidation, announceFormSubmission };
};