'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToggleSwitchProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  variant = 'default',
  showLabels = false,
  onLabel = 'On',
  offLabel = 'Off',
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      padding: 'p-0.5',
      text: 'text-xs'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      padding: 'p-0.5',
      text: 'text-sm'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      padding: 'p-0.5',
      text: 'text-base'
    }
  };

  const variantConfig = {
    default: {
      trackOn: 'bg-brand-500',
      trackOff: 'bg-gray-600',
      thumb: 'bg-white',
      focus: 'focus:ring-brand-500'
    },
    success: {
      trackOn: 'bg-green-500',
      trackOff: 'bg-gray-600',
      thumb: 'bg-white',
      focus: 'focus:ring-green-500'
    },
    warning: {
      trackOn: 'bg-yellow-500',
      trackOff: 'bg-gray-600',
      thumb: 'bg-white',
      focus: 'focus:ring-yellow-500'
    },
    error: {
      trackOn: 'bg-red-500',
      trackOff: 'bg-gray-600',
      thumb: 'bg-white',
      focus: 'focus:ring-red-500'
    }
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  const trackVariants = {
    off: {
      backgroundColor: disabled ? '#374151' : '#4B5563',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    on: {
      backgroundColor: disabled ? '#6B7280' : 
        variant === 'default' ? '#8B5CF6' :
        variant === 'success' ? '#10B981' :
        variant === 'warning' ? '#F59E0B' : '#EF4444',
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  };

  const thumbVariants = {
    off: {
      x: 0,
      scale: isPressed ? 1.1 : 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    on: {
      x: size === 'sm' ? 16 : size === 'md' ? 20 : 28,
      scale: isPressed ? 1.1 : 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
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

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsPressed(true);
      handleToggle();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      setIsPressed(false);
    }
  };

  useEffect(() => {
    if (isPressed) {
      const timer = setTimeout(() => setIsPressed(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isPressed]);

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Toggle Switch */}
      <div className="relative flex-shrink-0">
        <motion.button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          className={`
            relative inline-flex items-center rounded-full
            transition-colors duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
            ${config.track} ${config.padding}
            ${colors.focus}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          variants={trackVariants}
          animate={checked ? 'on' : 'off'}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
          {/* Hidden input for form submission */}
          <input
            ref={inputRef}
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={() => {}} // Controlled by button
            className="sr-only"
            disabled={disabled}
          />

          {/* Track background with gradient effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            variants={trackVariants}
            animate={checked ? 'on' : 'off'}
          />

          {/* Thumb */}
          <motion.div
            className={`
              relative rounded-full shadow-lg
              ${config.thumb} ${colors.thumb}
              ${disabled ? 'shadow-gray-400/50' : 'shadow-black/20'}
            `}
            variants={thumbVariants}
            animate={checked ? 'on' : 'off'}
          >
            {/* Thumb icon/indicator */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: checked ? 1 : 0 }}
              transition={{ delay: checked ? 0.1 : 0 }}
            >
              {/* Optional check icon for enabled state */}
              {size !== 'sm' && (
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </motion.div>

            {/* Ripple effect */}
            <AnimatePresence>
              {isPressed && (
                <motion.div
                  className={`
                    absolute inset-0 rounded-full
                    ${checked ? colors.trackOn : colors.trackOff}
                  `}
                  variants={rippleVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.button>

        {/* State labels */}
        {showLabels && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <motion.span
              className={`${config.text} font-medium`}
              animate={{
                color: checked ? 
                  (variant === 'default' ? '#8B5CF6' :
                   variant === 'success' ? '#10B981' :
                   variant === 'warning' ? '#F59E0B' : '#EF4444') : '#9CA3AF'
              }}
              transition={{ duration: 0.2 }}
            >
              {checked ? onLabel : offLabel}
            </motion.span>
          </div>
        )}
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <motion.label
              id={`${id}-label`}
              htmlFor={id}
              className={`
                block font-medium cursor-pointer
                ${config.text} text-white
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={handleToggle}
              whileHover={!disabled ? { x: 2 } : undefined}
            >
              {label}
            </motion.label>
          )}
          {description && (
            <motion.p
              id={`${id}-description`}
              className={`
                text-gray-400 mt-1
                ${config.text === 'text-base' ? 'text-sm' : 'text-xs'}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;