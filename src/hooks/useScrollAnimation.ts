'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

export interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  easing?: string;
  offset?: number;
}

export interface ScrollAnimationReturn {
  isVisible: boolean;
  trigger: () => void;
  reset: () => void;
  progress: number;
}

export function useScrollAnimation(
  elementRef: RefObject<Element>,
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
    offset = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [progress, setProgress] = useState(0);

  const isIntersecting = useIntersectionObserver(elementRef, {
    threshold,
    rootMargin,
    freezeOnceVisible: triggerOnce
  });

  // Manual trigger function
  const trigger = useCallback(() => {
    if (delay > 0) {
      setTimeout(() => {
        setIsVisible(true);
        setHasTriggered(true);
      }, delay);
    } else {
      setIsVisible(true);
      setHasTriggered(true);
    }
  }, [delay]);

  // Reset function
  const reset = useCallback(() => {
    setIsVisible(false);
    setHasTriggered(false);
    setProgress(0);
  }, []);

  // Calculate scroll progress for the element
  useEffect(() => {
    if (!elementRef.current) return;

    const calculateProgress = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the element is visible
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const elementHeight = rect.height;
      
      if (elementHeight === 0) return;
      
      const progressValue = Math.max(0, Math.min(1, visibleHeight / elementHeight));
      setProgress(progressValue);
    };

    const handleScroll = () => {
      calculateProgress();
    };

    // Only add scroll listener if element is intersecting
    if (isIntersecting) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      calculateProgress(); // Initial calculation
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isIntersecting, elementRef]);

  // Handle intersection changes
  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (isIntersecting && (!triggerOnce || !hasTriggered)) {
      trigger();
    } else if (!isIntersecting && !triggerOnce) {
      setIsVisible(false);
    }
  }, [isIntersecting, triggerOnce, hasTriggered, trigger]);

  return {
    isVisible,
    trigger,
    reset,
    progress
  };
}

export default useScrollAnimation;