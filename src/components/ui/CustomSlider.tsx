'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CustomSliderProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  showValue?: boolean;
  showTicks?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  formatValue?: (value: number) => string;
  className?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  id,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description,
  disabled = false,
  showValue = true,
  showTicks = false,
  variant = 'default',
  size = 'md',
  formatValue = (val) => val.toString(),
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const sizeConfig = {
    sm: {
      track: 'h-1',
      thumb: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      track: 'h-2',
      thumb: 'w-5 h-5',
      text: 'text-sm',
      gap: 'gap-3'
    },
    lg: {
      track: 'h-3',
      thumb: 'w-6 h-6',
      text: 'text-base',
      gap: 'gap-4'
    }
  };

  const variantConfig = {
    default: {
      track: 'bg-brand-500',
      trackInactive: 'bg-gray-700',
      thumb: 'bg-white border-brand-500',
      focus: 'focus:ring-brand-500'
    },
    success: {
      track: 'bg-green-500',
      trackInactive: 'bg-gray-700',
      thumb: 'bg-white border-green-500',
      focus: 'focus:ring-green-500'
    },
    warning: {
      track: 'bg-yellow-500',
      trackInactive: 'bg-gray-700',
      thumb: 'bg-white border-yellow-500',
      focus: 'focus:ring-yellow-500'
    },
    error: {
      track: 'bg-red-500',
      trackInactive: 'bg-gray-700',
      thumb: 'bg-white border-red-500',
      focus: 'focus:ring-red-500'
    }
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  // Calculate percentage and position
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  // Generate tick marks
  const generateTicks = () => {
    const ticks = [];
    const tickCount = Math.min(11, Math.floor((max - min) / step) + 1); // Max 11 ticks
    const tickStep = (max - min) / (tickCount - 1);
    
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + (tickStep * i);
      const tickPercentage = ((tickValue - min) / (max - min)) * 100;
      ticks.push({
        value: tickValue,
        percentage: tickPercentage,
        isActive: tickValue <= localValue
      });
    }
    return ticks;
  };

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    setLocalValue(clampedValue);
  }, [min, max, step, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    updateValue(e.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      onChange(localValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    let newValue = localValue;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(max, localValue + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(min, localValue - step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = Math.min(max, localValue + step * 10);
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = Math.max(min, localValue - step * 10);
        break;
      default:
        return;
    }
    
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const thumbVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
    dragging: {
      scale: 1.2,
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
    }
  };

  const trackVariants = {
    idle: { scaleY: 1 },
    active: { scaleY: 1.2 }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className={`flex items-center justify-between mb-2 ${config.gap}`}>
          {label && (
            <label
              htmlFor={id}
              className={`
                font-medium text-white
                ${config.text}
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {label}
            </label>
          )}
          {showValue && (
            <motion.span
              className={`
                font-mono font-semibold
                ${config.text}
                ${variant === 'default' ? 'text-brand-400' :
                  variant === 'success' ? 'text-green-400' :
                  variant === 'warning' ? 'text-yellow-400' : 'text-red-400'}
              `}
              animate={{ scale: isDragging ? 1.1 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {formatValue(localValue)}
            </motion.span>
          )}
        </div>
      )}

      {/* Slider Track */}
      <div className="relative py-2">
        <motion.div
          ref={sliderRef}
          className={`
            relative w-full rounded-full cursor-pointer
            ${config.track} ${colors.trackInactive}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          variants={trackVariants}
          animate={isDragging ? 'active' : 'idle'}
          onMouseDown={handleMouseDown}
        >
          {/* Active Track */}
          <motion.div
            className={`
              absolute top-0 left-0 rounded-full
              ${config.track} ${colors.track}
            `}
            style={{ width: `${percentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />

          {/* Tick Marks */}
          {showTicks && (
            <div className="absolute inset-0">
              {generateTicks().map((tick, index) => (
                <motion.div
                  key={index}
                  className={`
                    absolute top-1/2 w-1 h-4 -mt-2 rounded-full
                    ${tick.isActive ? colors.track : 'bg-gray-600'}
                  `}
                  style={{ left: `${tick.percentage}%`, marginLeft: '-2px' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                />
              ))}
            </div>
          )}

          {/* Thumb */}
          <motion.div
            ref={thumbRef}
            className={`
              absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
              rounded-full border-2 cursor-grab
              ${config.thumb} ${colors.thumb}
              ${disabled ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
              ${colors.focus}
            `}
            style={{ left: `${percentage}%` }}
            variants={thumbVariants}
            animate={isDragging ? 'dragging' : 'idle'}
            whileHover={!disabled ? 'hover' : undefined}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={localValue}
            aria-labelledby={label ? `${id}-label` : undefined}
            aria-describedby={description ? `${id}-description` : undefined}
            onKeyDown={handleKeyDown}
          >
            {/* Thumb inner glow */}
            <motion.div
              className={`
                absolute inset-0 rounded-full
                ${colors.track}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isDragging ? 0.3 : 0,
                scale: isDragging ? 1.5 : 0.8
              }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>
        </motion.div>

        {/* Hidden native input for form submission */}
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={() => {}} // Controlled by mouse/keyboard handlers
          className="sr-only"
          disabled={disabled}
        />
      </div>

      {/* Description */}
      {description && (
        <motion.p
          id={`${id}-description`}
          className={`
            text-gray-400 mt-2
            ${config.text === 'text-base' ? 'text-sm' : 'text-xs'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>
      )}

      {/* Min/Max Labels */}
      <div className={`flex justify-between mt-1 ${config.text} text-gray-500`}>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default CustomSlider;