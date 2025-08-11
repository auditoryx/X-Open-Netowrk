'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useTransform, useScroll, MotionValue } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: number;
  className?: string;
  disabled?: boolean;
  overflow?: 'visible' | 'hidden';
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  offset = 0,
  className = '',
  disabled = false,
  overflow = 'hidden',
  easing = 'linear'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const { transform } = useParallax({
    speed,
    direction,
    offset,
    disabled,
    easing
  });

  // Transform scroll progress to movement values based on direction
  const getTransformValue = (): MotionValue<string> => {
    const range = [-200 * speed, 200 * speed];
    
    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], [`translateY(${range[1]}px)`, `translateY(${range[0]}px)`]);
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [`translateY(${range[0]}px)`, `translateY(${range[1]}px)`]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [`translateX(${range[1]}px)`, `translateX(${range[0]}px)`]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [`translateX(${range[0]}px)`, `translateX(${range[1]}px)`]);
      default:
        return useTransform(scrollYProgress, [0, 1], [`translateY(${range[1]}px)`, `translateY(${range[0]}px)`]);
    }
  };

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className={className} style={{ overflow }}>
        {children}
      </div>
    );
  }

  // Respect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (disabled || prefersReducedMotion) {
    return (
      <div ref={ref} className={className} style={{ overflow }}>
        {children}
      </div>
    );
  }

  const transformValue = getTransformValue();

  return (
    <div ref={ref} className={className} style={{ overflow }}>
      <motion.div
        style={{
          transform: transformValue,
          willChange: 'transform'
        }}
        className="animate-gpu"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Background parallax component for images or backgrounds
export const ParallaxBackground: React.FC<{
  src: string;
  alt?: string;
  speed?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}> = ({
  src,
  alt = '',
  speed = 0.3,
  className = '',
  objectFit = 'cover'
}) => {
  return (
    <ParallaxSection
      speed={speed}
      className={`relative ${className}`}
      overflow="hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: objectFit,
          height: '120%', // Extra height for parallax effect
          top: '-10%'
        }}
        role="img"
        aria-label={alt}
      />
    </ParallaxSection>
  );
};

// Text parallax component with multiple layers
export const ParallaxText: React.FC<{
  children: React.ReactNode;
  speeds?: number[];
  className?: string;
}> = ({
  children,
  speeds = [0.2, 0.5, 0.8],
  className = ''
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={`relative ${className}`}>
      {childrenArray.map((child, index) => (
        <ParallaxSection
          key={index}
          speed={speeds[index] || speeds[speeds.length - 1]}
          className="absolute inset-0"
        >
          {child}
        </ParallaxSection>
      ))}
    </div>
  );
};

// Smooth parallax container with multiple elements
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Performance optimization: use passive scroll listener
    const handleScroll = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      
      // Trigger reflow for smooth animations
      element.style.transform = `translate3d(0, ${window.scrollY * 0.1}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`animate-gpu ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;