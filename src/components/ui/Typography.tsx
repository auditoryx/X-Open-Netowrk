'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAnimatedText } from '@/hooks/useLoadingState';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'mono';
  animate?: boolean;
  animateDelay?: number;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  animate = false,
  animateDelay = 0,
  className = '',
}) => {
  const text = typeof children === 'string' ? children : '';
  const { animatedText, isComplete } = useAnimatedText(text, { 
    delay: 50, 
    enabled: animate && Boolean(text) 
  });

  const baseClasses = {
    h1: 'text-5xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold font-heading tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold font-heading tracking-tight',
    h4: 'text-xl md:text-2xl font-semibold font-heading tracking-tight',
    body: 'text-base md:text-lg font-body leading-relaxed',
    caption: 'text-sm text-gray-400 font-body',
    mono: 'text-base font-mono tracking-wider',
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  const content = animate && text ? (
    <>
      {animatedText}
      {!isComplete && text && (
        <motion.span
          className="inline-block w-0.5 h-[1em] bg-brand-500 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </>
  ) : children;

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1],
        delay: animateDelay 
      }}
    >
      <Component className={`${baseClasses[variant]} ${className}`}>
        {content}
      </Component>
    </motion.div>
  );
};

export default Typography;