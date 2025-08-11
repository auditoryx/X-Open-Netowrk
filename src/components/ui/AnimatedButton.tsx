'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  animationType?: 'hover' | 'press' | 'glow' | 'none';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  href,
  className = '',
  animationType = 'hover',
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black rounded-lg';

  const variantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white focus:ring-brand-500',
    ghost: 'text-brand-500 hover:bg-brand-500/10 focus:ring-brand-500',
    minimal: 'text-gray-300 hover:text-white focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const getAnimationProps = () => {
    if (animationType === 'none' || disabled) return {};

    switch (animationType) {
      case 'hover':
        return {
          whileHover: { scale: 1.05, y: -2 },
          whileTap: { scale: 0.98 },
        };
      case 'press':
        return {
          whileTap: { scale: 0.95 },
        };
      case 'glow':
        return {
          whileHover: { 
            scale: 1.05,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
          },
          whileTap: { scale: 0.98 },
        };
      default:
        return {};
    }
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `;

  const buttonContent = (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'invisible' : 'visible'}>
        {children}
      </span>
      
      {/* Ripple effect background */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
        />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        {...getAnimationProps()}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...getAnimationProps()}
    >
      {buttonContent}
    </motion.button>
  );
};

export default AnimatedButton;