'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

export interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: number;
  disabled?: boolean;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

export interface ParallaxReturn {
  transform: string;
  progress: number;
  isInView: boolean;
}

export function useParallax(options: ParallaxOptions = {}): ParallaxReturn {
  const {
    speed = 0.5,
    direction = 'up',
    offset = 0,
    disabled = false,
    easing = 'linear'
  } = options;

  const [transform, setTransform] = useState('translate3d(0, 0, 0)');
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  };

  const calculateTransform = useCallback((scrollY: number, elementTop: number, elementHeight: number, windowHeight: number) => {
    if (disabled) {
      return 'translate3d(0, 0, 0)';
    }

    // Calculate if element is in viewport
    const elementBottom = elementTop + elementHeight;
    const viewportTop = scrollY;
    const viewportBottom = scrollY + windowHeight;
    
    const inView = elementBottom > viewportTop && elementTop < viewportBottom;
    setIsInView(inView);

    if (!inView && Math.abs(elementTop - viewportTop) > windowHeight * 2) {
      // Element is far from viewport, don't calculate parallax
      return transform;
    }

    // Calculate scroll progress relative to element
    const elementCenter = elementTop + elementHeight / 2;
    const viewportCenter = scrollY + windowHeight / 2;
    const distance = elementCenter - viewportCenter;
    
    // Normalize distance to a progress value (-1 to 1)
    const maxDistance = windowHeight + elementHeight;
    const normalizedProgress = Math.max(-1, Math.min(1, distance / maxDistance));
    
    // Apply easing
    const easedProgress = easingFunctions[easing](Math.abs(normalizedProgress)) * Math.sign(normalizedProgress);
    setProgress(easedProgress);
    
    // Calculate movement based on direction and speed
    const movement = easedProgress * speed * 100 + offset;
    
    let transformValue = '';
    switch (direction) {
      case 'up':
        transformValue = `translate3d(0, ${-movement}px, 0)`;
        break;
      case 'down':
        transformValue = `translate3d(0, ${movement}px, 0)`;
        break;
      case 'left':
        transformValue = `translate3d(${-movement}px, 0, 0)`;
        break;
      case 'right':
        transformValue = `translate3d(${movement}px, 0, 0)`;
        break;
      default:
        transformValue = `translate3d(0, ${-movement}px, 0)`;
    }
    
    return transformValue;
  }, [speed, direction, offset, disabled, easing, transform]);

  useEffect(() => {
    if (disabled) {
      setTransform('translate3d(0, 0, 0)');
      return;
    }

    // Check for reduced motion preference
    if (typeof window === 'undefined') {
      setTransform('translate3d(0, 0, 0)');
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setTransform('translate3d(0, 0, 0)');
      return;
    }

    let rafId: number;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      
      // Only update if scroll position changed significantly
      if (Math.abs(scrollY - lastScrollY) < 1) {
        rafId = requestAnimationFrame(updateParallax);
        return;
      }
      
      lastScrollY = scrollY;
      
      // Get viewport dimensions
      const windowHeight = window.innerHeight;
      
      // For now, assume we're working with the whole viewport
      // In a real implementation, you'd need to pass element ref or calculate based on specific element
      const elementTop = 0;
      const elementHeight = windowHeight;
      
      const newTransform = calculateTransform(scrollY, elementTop, elementHeight, windowHeight);
      setTransform(newTransform);
      
      rafId = requestAnimationFrame(updateParallax);
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    // Start the animation loop
    rafId = requestAnimationFrame(updateParallax);
    
    // Add scroll listener for updates
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle reduced motion changes
    const handleMotionChange = () => {
      if (mediaQuery.matches) {
        setTransform('translate3d(0, 0, 0)');
      }
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, [calculateTransform, disabled]);

  return {
    transform,
    progress,
    isInView
  };
}

// Hook for element-specific parallax with ref
export function useElementParallax(
  elementRef: RefObject<HTMLElement>,
  options: ParallaxOptions = {}
): ParallaxReturn {
  const {
    speed = 0.5,
    direction = 'up',
    offset = 0,
    disabled = false,
    easing = 'linear'
  } = options;

  const [transform, setTransform] = useState('translate3d(0, 0, 0)');
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) {
      setTransform('translate3d(0, 0, 0)');
      return;
    }

    // Check for reduced motion preference
    if (typeof window === 'undefined') {
      setTransform('translate3d(0, 0, 0)');
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setTransform('translate3d(0, 0, 0)');
      return;
    }

    let rafId: number;

    const updateParallax = () => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const elementBottom = elementTop + elementHeight;
      
      // Check if element is in viewport
      const inView = elementBottom > scrollY && elementTop < scrollY + windowHeight;
      setIsInView(inView);
      
      if (!inView && Math.abs(elementTop - scrollY) > windowHeight * 2) {
        // Element is far from viewport, skip calculation
        return;
      }
      
      // Calculate parallax effect
      const elementCenter = elementTop + elementHeight / 2;
      const viewportCenter = scrollY + windowHeight / 2;
      const distance = elementCenter - viewportCenter;
      
      // Normalize to progress (-1 to 1)
      const maxDistance = windowHeight + elementHeight;
      const normalizedProgress = Math.max(-1, Math.min(1, distance / maxDistance));
      setProgress(normalizedProgress);
      
      // Apply movement
      const movement = normalizedProgress * speed * 100 + offset;
      
      let transformValue = '';
      switch (direction) {
        case 'up':
          transformValue = `translate3d(0, ${-movement}px, 0)`;
          break;
        case 'down':
          transformValue = `translate3d(0, ${movement}px, 0)`;
          break;
        case 'left':
          transformValue = `translate3d(${-movement}px, 0, 0)`;
          break;
        case 'right':
          transformValue = `translate3d(${movement}px, 0, 0)`;
          break;
        default:
          transformValue = `translate3d(0, ${-movement}px, 0)`;
      }
      
      setTransform(transformValue);
    };

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateParallax);
    };

    // Initial calculation
    updateParallax();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateParallax);
    };
  }, [elementRef, speed, direction, offset, disabled, easing]);

  return {
    transform,
    progress,
    isInView
  };
}

export default useParallax;