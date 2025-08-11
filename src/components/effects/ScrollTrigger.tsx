'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollTriggerProps {
  children: React.ReactNode | ((props: ScrollTriggerRenderProps) => React.ReactNode);
  onEnter?: () => void;
  onLeave?: () => void;
  onProgress?: (progress: number) => void;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

interface ScrollTriggerRenderProps {
  isVisible: boolean;
  progress: number;
  trigger: () => void;
  reset: () => void;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  onEnter,
  onLeave,
  onProgress,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  delay = 0,
  className = '',
  disabled = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevVisibleRef = useRef<boolean>(false);

  const { isVisible, trigger, reset, progress } = useScrollAnimation(ref, {
    threshold,
    rootMargin,
    triggerOnce,
    delay
  });

  // Handle visibility changes
  useEffect(() => {
    if (disabled) return;

    if (isVisible !== prevVisibleRef.current) {
      if (isVisible) {
        onEnter?.();
      } else {
        onLeave?.();
      }
      prevVisibleRef.current = isVisible;
    }
  }, [isVisible, onEnter, onLeave, disabled]);

  // Handle progress changes
  useEffect(() => {
    if (disabled) return;
    
    onProgress?.(progress);
  }, [progress, onProgress, disabled]);

  const renderProps: ScrollTriggerRenderProps = {
    isVisible,
    progress,
    trigger,
    reset
  };

  const renderChildren = useCallback(() => {
    if (typeof children === 'function') {
      return children(renderProps);
    }
    return children;
  }, [children, renderProps]);

  if (disabled) {
    return <div className={className}>{renderChildren()}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {renderChildren()}
    </div>
  );
};

// Specialized scroll trigger components
export const ScrollProgressTrigger: React.FC<Omit<ScrollTriggerProps, 'children'> & {
  children: ((progress: number) => React.ReactNode) | React.ReactNode;
}> = ({ children, ...props }) => (
  <ScrollTrigger {...props}>
    {({ progress }) => typeof children === 'function' ? children(progress) : children}
  </ScrollTrigger>
);

export const ScrollVisibilityTrigger: React.FC<Omit<ScrollTriggerProps, 'children'> & {
  children: ((isVisible: boolean) => React.ReactNode) | React.ReactNode;
}> = ({ children, ...props }) => (
  <ScrollTrigger {...props}>
    {({ isVisible }) => typeof children === 'function' ? children(isVisible) : children}
  </ScrollTrigger>
);

// Hook for imperative scroll trigger usage
export const useScrollTrigger = (
  onEnter?: () => void,
  onLeave?: () => void,
  options?: Omit<ScrollTriggerProps, 'children' | 'onEnter' | 'onLeave'>
) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevVisibleRef = useRef<boolean>(false);

  const { isVisible, trigger, reset, progress } = useScrollAnimation(ref, options);

  useEffect(() => {
    if (isVisible !== prevVisibleRef.current) {
      if (isVisible) {
        onEnter?.();
      } else {
        onLeave?.();
      }
      prevVisibleRef.current = isVisible;
    }
  }, [isVisible, onEnter, onLeave]);

  return {
    ref,
    isVisible,
    progress,
    trigger,
    reset
  };
};

export default ScrollTrigger;