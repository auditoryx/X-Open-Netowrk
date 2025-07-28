/**
 * Keyboard Navigation Utilities
 * 
 * Comprehensive keyboard navigation support for accessibility compliance
 */

import { useCallback, useEffect, useState, RefObject } from 'react';

// Keyboard key constants
export const KEYS = {
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
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Focusable element selector
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

// Get all focusable elements within a container
export const getFocusableElements = (container: Element): HTMLElement[] => {
  return Array.from(container.querySelectorAll(FOCUSABLE_ELEMENTS));
};

// Focus trap hook for modals and dropdowns
export const useFocusTrap = (isActive: boolean, containerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when trap becomes active
    firstElement.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== KEYS.TAB) return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

// Arrow key navigation for lists and menus
export const useArrowNavigation = (items: RefObject<HTMLElement>[], isActive: boolean = true) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const focusItem = useCallback((index: number) => {
    if (items[index]?.current) {
      items[index].current?.focus();
      setCurrentIndex(index);
    }
  }, [items]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || items.length === 0) return;

    switch (event.key) {
      case KEYS.ARROW_DOWN:
        event.preventDefault();
        focusItem(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
        break;
      case KEYS.ARROW_UP:
        event.preventDefault();
        focusItem(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
        break;
      case KEYS.HOME:
        event.preventDefault();
        focusItem(0);
        break;
      case KEYS.END:
        event.preventDefault();
        focusItem(items.length - 1);
        break;
    }
  }, [currentIndex, focusItem, isActive, items.length]);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isActive]);

  return { currentIndex, focusItem };
};

// Grid navigation (2D arrow key navigation)
export const useGridNavigation = (
  gridRef: RefObject<HTMLElement>,
  rowSelector: string = '[role="row"]',
  cellSelector: string = '[role="gridcell"], [role="cell"]'
) => {
  const [currentPosition, setCurrentPosition] = useState({ row: 0, cell: 0 });

  const getGridCells = useCallback(() => {
    if (!gridRef.current) return [];
    
    const rows = Array.from(gridRef.current.querySelectorAll(rowSelector));
    return rows.map(row => Array.from(row.querySelectorAll(cellSelector)) as HTMLElement[]);
  }, [gridRef, rowSelector, cellSelector]);

  const focusCell = useCallback((row: number, cell: number) => {
    const grid = getGridCells();
    if (grid[row] && grid[row][cell]) {
      grid[row][cell].focus();
      setCurrentPosition({ row, cell });
    }
  }, [getGridCells]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gridRef.current?.contains(document.activeElement as Node)) return;

    const grid = getGridCells();
    const { row, cell } = currentPosition;

    switch (event.key) {
      case KEYS.ARROW_DOWN:
        event.preventDefault();
        if (row < grid.length - 1) {
          focusCell(row + 1, Math.min(cell, grid[row + 1].length - 1));
        }
        break;
      case KEYS.ARROW_UP:
        event.preventDefault();
        if (row > 0) {
          focusCell(row - 1, Math.min(cell, grid[row - 1].length - 1));
        }
        break;
      case KEYS.ARROW_RIGHT:
        event.preventDefault();
        if (cell < grid[row].length - 1) {
          focusCell(row, cell + 1);
        } else if (row < grid.length - 1) {
          focusCell(row + 1, 0);
        }
        break;
      case KEYS.ARROW_LEFT:
        event.preventDefault();
        if (cell > 0) {
          focusCell(row, cell - 1);
        } else if (row > 0) {
          focusCell(row - 1, grid[row - 1].length - 1);
        }
        break;
      case KEYS.HOME:
        event.preventDefault();
        focusCell(row, 0);
        break;
      case KEYS.END:
        event.preventDefault();
        focusCell(row, grid[row].length - 1);
        break;
    }
  }, [currentPosition, focusCell, getGridCells, gridRef]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { currentPosition, focusCell };
};

// Escape key handler
export const useEscapeKey = (callback: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === KEYS.ESCAPE) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
};

// Enter/Space activation handler for custom interactive elements
export const useEnterSpaceActivation = (callback: () => void) => {
  return useCallback((event: KeyboardEvent) => {
    if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
      event.preventDefault();
      callback();
    }
  }, [callback]);
};

// Roving tabindex management for complex widgets
export const useRovingTabIndex = (items: RefObject<HTMLElement>[]) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    items.forEach((item, index) => {
      if (item.current) {
        item.current.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [activeIndex, items]);

  const setActiveItem = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setActiveIndex(index);
      items[index].current?.focus();
    }
  }, [items]);

  return { activeIndex, setActiveItem };
};

// Skip links utility
export const useSkipLinks = () => {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' },
  ];

  return skipLinks;
};

// Keyboard shortcut handler
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };

      // Create shortcut string (e.g., "ctrl+s", "alt+shift+n")
      const shortcutKey = [
        modifiers.ctrl && 'ctrl',
        modifiers.alt && 'alt',
        modifiers.shift && 'shift',
        modifiers.meta && 'meta',
        key,
      ].filter(Boolean).join('+');

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Custom hook for managing focus restoration
export const useFocusRestore = () => {
  const previousActiveElement = useCallback(() => {
    return document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus();
    }
  }, []);

  return { previousActiveElement, restoreFocus };
};

// Utility to check if element is focusable
export const isFocusable = (element: Element): boolean => {
  return element.matches(FOCUSABLE_ELEMENTS);
};

// Utility to find next/previous focusable element
export const findNextFocusableElement = (
  current: Element,
  direction: 'next' | 'previous' = 'next'
): HTMLElement | null => {
  const focusableElements = getFocusableElements(document.body);
  const currentIndex = focusableElements.indexOf(current as HTMLElement);
  
  if (currentIndex === -1) return null;
  
  const nextIndex = direction === 'next' 
    ? (currentIndex + 1) % focusableElements.length
    : (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    
  return focusableElements[nextIndex];
};