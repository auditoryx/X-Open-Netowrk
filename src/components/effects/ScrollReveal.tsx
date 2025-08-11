'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  stagger?: number;
  className?: string;
  rootMargin?: string;
}

const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  rotateIn: {
    hidden: { opacity: 0, rotate: -10, scale: 0.8 },
    visible: { opacity: 1, rotate: 0, scale: 1 }
  }
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  triggerOnce = true,
  stagger = 0,
  className = '',
  rootMargin = '0px 0px -50px 0px'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [hasTriggered, setHasTriggered] = useState(false);

  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
    freezeOnceVisible: triggerOnce
  });

  useEffect(() => {
    // Respect user's reduced motion preference
    if (typeof window === 'undefined') {
      controls.set('visible');
      return;
    }
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      controls.set('visible');
      return;
    }

    if (isIntersecting && (!triggerOnce || !hasTriggered)) {
      const actualDelay = delay + stagger;
      
      setTimeout(() => {
        controls.start('visible');
        setHasTriggered(true);
      }, actualDelay * 1000);
    } else if (!isIntersecting && !triggerOnce) {
      controls.start('hidden');
    }
  }, [isIntersecting, controls, delay, stagger, triggerOnce, hasTriggered]);

  // For multiple children, wrap them individually if stagger is enabled
  const renderChildren = () => {
    if (stagger > 0 && React.Children.count(children) > 1) {
      return React.Children.map(children, (child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          delay={delay + (index * stagger)}
          duration={duration}
          threshold={threshold}
          triggerOnce={triggerOnce}
          rootMargin={rootMargin}
        >
          {child}
        </ScrollReveal>
      ));
    }
    return children;
  };

  return (
    <motion.div
      ref={ref}
      className={`animate-gpu ${className}`}
      initial="hidden"
      animate={controls}
      variants={animationVariants[animation]}
      transition={{
        duration,
        ease: [0.16, 1, 0.3, 1], // Custom easing function
        delay: 0 // Delay is handled by useEffect
      }}
    >
      {renderChildren()}
    </motion.div>
  );
};

// Specialized components for common use cases
export const FadeInOnScroll: React.FC<Omit<ScrollRevealProps, 'animation'>> = (props) => (
  <ScrollReveal {...props} animation="fadeIn" />
);

export const SlideUpOnScroll: React.FC<Omit<ScrollRevealProps, 'animation'>> = (props) => (
  <ScrollReveal {...props} animation="slideUp" />
);

export const StaggerReveal: React.FC<ScrollRevealProps & { staggerDelay?: number }> = ({ 
  staggerDelay = 0.1, 
  ...props 
}) => (
  <ScrollReveal {...props} stagger={staggerDelay} />
);

export default ScrollReveal;