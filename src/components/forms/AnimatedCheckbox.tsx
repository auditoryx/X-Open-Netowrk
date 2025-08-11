'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface AnimatedCheckboxProps {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      text: 'text-sm',
      gap: 'gap-2'
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-3.5 h-3.5',
      text: 'text-base',
      gap: 'gap-3'
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-4 h-4',
      text: 'text-lg',
      gap: 'gap-4'
    }
  };

  const variantClasses = {
    default: {
      border: checked ? 'border-brand-500' : 'border-gray-600',
      bg: checked ? 'bg-brand-500' : 'bg-transparent',
      focus: 'focus:ring-brand-500',
      label: 'text-white'
    },
    success: {
      border: checked ? 'border-green-500' : 'border-gray-600',
      bg: checked ? 'bg-green-500' : 'bg-transparent',
      focus: 'focus:ring-green-500',
      label: 'text-white'
    },
    warning: {
      border: checked ? 'border-yellow-500' : 'border-gray-600',
      bg: checked ? 'bg-yellow-500' : 'bg-transparent',
      focus: 'focus:ring-yellow-500',
      label: 'text-white'
    },
    error: {
      border: checked ? 'border-red-500' : 'border-gray-600',
      bg: checked ? 'bg-red-500' : 'bg-transparent',
      focus: 'focus:ring-red-500',
      label: 'text-white'
    }
  };

  const checkboxVariants = {
    unchecked: { 
      scale: 1,
      backgroundColor: 'transparent',
      borderWidth: '2px'
    },
    checked: { 
      scale: 1.05,
      backgroundColor: variantClasses[variant].bg.includes('brand') ? '#8B5CF6' : 
                      variantClasses[variant].bg.includes('green') ? '#10B981' :
                      variantClasses[variant].bg.includes('yellow') ? '#F59E0B' : '#EF4444',
      borderWidth: '2px',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  const checkmarkVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0, 
      rotate: -90 
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: 0.1
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      rotate: 90,
      transition: { duration: 0.15 }
    }
  };

  const labelVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.1 }
    }
  };

  const rippleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 2, 
      opacity: [0, 0.3, 0],
      transition: { duration: 0.4 }
    }
  };

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <motion.div
      variants={labelVariants}
      initial="initial"
      animate="animate"
      className={`flex items-start ${sizeClasses[size].gap} ${className}`}
    >
      {/* Checkbox Container */}
      <div className="relative flex-shrink-0">
        <motion.div
          className={`
            relative cursor-pointer rounded-md border-2
            transition-colors duration-200 flex items-center justify-center
            ${sizeClasses[size].checkbox}
            ${variantClasses[variant].border}
            ${variantClasses[variant].bg}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
            ${variantClasses[variant].focus}
          `}
          variants={checkboxVariants}
          animate={checked ? 'checked' : 'unchecked'}
          whileHover={!disabled ? 'hover' : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="checkbox"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
        >
          {/* Hidden native input for form submission */}
          <input
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={() => {}} // Controlled by motion.div
            className="sr-only"
            disabled={disabled}
          />

          {/* Checkmark Icon */}
          <AnimatePresence mode="wait">
            {checked && (
              <motion.div
                key="checkmark"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckIcon className={`${sizeClasses[size].icon} text-white`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ripple Effect */}
          <motion.div
            className={`
              absolute inset-0 rounded-md
              ${variantClasses[variant].bg}
            `}
            variants={rippleVariants}
            initial="hidden"
            animate={checked ? "visible" : "hidden"}
          />
        </motion.div>
      </div>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <motion.label
              id={`${id}-label`}
              htmlFor={id}
              className={`
                block font-medium cursor-pointer
                ${sizeClasses[size].text}
                ${variantClasses[variant].label}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={!disabled ? { x: 2 } : undefined}
              onClick={handleChange}
            >
              {label}
            </motion.label>
          )}
          {description && (
            <motion.p
              id={`${id}-description`}
              className={`
                text-gray-400 mt-1
                ${sizeClasses[size].text === 'text-lg' ? 'text-base' : 'text-sm'}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AnimatedCheckbox;