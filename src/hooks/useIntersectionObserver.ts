'use client';

import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverProps = {}
): boolean {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    freezeOnceVisible = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    // If element doesn't exist or we've already seen it and should freeze
    if (!element || (freezeOnceVisible && isIntersecting)) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: assume element is visible
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (isElementIntersecting) {
          setIsIntersecting(true);
          
          // If we should freeze once visible, disconnect the observer
          if (freezeOnceVisible) {
            observer.unobserve(element);
          }
        } else if (!freezeOnceVisible) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    // Cleanup function
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold, rootMargin, root, freezeOnceVisible, isIntersecting]);

  return isIntersecting;
}