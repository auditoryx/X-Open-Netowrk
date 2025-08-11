'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ProgressRingProps {
  value: number; // 0-100
  max?: number;
  size?: number;
  thickness?: number;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray' | 'cyan' | 'orange';
  backgroundColor?: string;
  label?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  animate?: boolean;
  duration?: number;
  delay?: number;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  suffix?: string;
  prefix?: string;
  gradient?: boolean;
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 120,
  thickness = 8,
  color = 'blue',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  label,
  showValue = true,
  showPercentage = false,
  animate = true,
  duration = 1000,
  delay = 0,
  icon: Icon,
  className = '',
  children,
  format = 'number',
  suffix = '',
  prefix = '',
  gradient = true,
  glow = false,
  interactive = false,
  onClick,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedValue / max) * circumference;

  // Animation
  useEffect(() => {
    if (!animate || !isInView) return;

    let startTime: number;
    const startValue = 0;
    const endValue = normalizedValue;

    const animateProgress = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Ease-out cubic animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateProgress);
    }, delay);

    return () => clearTimeout(timer);
  }, [normalizedValue, animate, delay, duration, isInView]);

  // Container animation
  useEffect(() => {
    if (isInView && animate) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.6,
          delay: delay / 1000,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      });
    }
  }, [isInView, controls, animate, delay]);

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        stroke: '#3B82F6',
        gradient: ['#3B82F6', '#1D4ED8'],
        glow: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
        text: 'text-blue-400',
      },
      green: {
        stroke: '#10B981',
        gradient: ['#10B981', '#059669'],
        glow: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))',
        text: 'text-green-400',
      },
      purple: {
        stroke: '#8B5CF6',
        gradient: ['#8B5CF6', '#7C3AED'],
        glow: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))',
        text: 'text-purple-400',
      },
      yellow: {
        stroke: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
        glow: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
        text: 'text-yellow-400',
      },
      red: {
        stroke: '#EF4444',
        gradient: ['#EF4444', '#DC2626'],
        glow: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))',
        text: 'text-red-400',
      },
      gray: {
        stroke: '#6B7280',
        gradient: ['#6B7280', '#4B5563'],
        glow: 'drop-shadow(0 0 10px rgba(107, 114, 128, 0.5))',
        text: 'text-gray-400',
      },
      cyan: {
        stroke: '#06B6D4',
        gradient: ['#06B6D4', '#0891B2'],
        glow: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))',
        text: 'text-cyan-400',
      },
      orange: {
        stroke: '#F97316',
        gradient: ['#F97316', '#EA580C'],
        glow: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))',
        text: 'text-orange-400',
      },
    };
    
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        if (val >= 1000000) {
          return `${(val / 1000000).toFixed(1)}M`;
        } else if (val >= 1000) {
          return `${(val / 1000).toFixed(1)}K`;
        }
        return val.toLocaleString();
    }
  };

  const colorData = getColorClasses(color);
  const displayValue = animate ? animatedValue : normalizedValue;
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, scale: 0.8 } : {}}
      animate={controls}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* SVG Ring */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className={`transform -rotate-90 ${glow ? colorData.glow : ''}`}
        >
          <defs>
            {gradient && (
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colorData.gradient[0]} />
                <stop offset="100%" stopColor={colorData.gradient[1]} />
              </linearGradient>
            )}
          </defs>
          
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={backgroundColor}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          
          {/* Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={gradient ? `url(#${gradientId})` : colorData.stroke}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={animate ? { strokeDashoffset: circumference } : {}}
            animate={animate ? { strokeDashoffset } : {}}
            transition={{
              duration: duration / 1000,
              delay: delay / 1000,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              filter: glow && isHovered ? `drop-shadow(0 0 20px ${colorData.stroke})` : '',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && (
            <motion.div
              animate={isHovered ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-1"
            >
              <Icon className={`w-6 h-6 ${colorData.text}`} />
            </motion.div>
          )}
          
          {children || (
            <div className="text-center">
              {showValue && (
                <motion.div
                  animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-white font-bold text-lg"
                >
                  {prefix}{formatValue(displayValue)}{suffix}
                </motion.div>
              )}
              
              {showPercentage && (
                <div className="text-gray-400 text-sm">
                  {((displayValue / max) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      {label && (
        <motion.p
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: (delay + 200) / 1000 }}
          className="mt-3 text-sm font-medium text-gray-300 text-center"
        >
          {label}
        </motion.p>
      )}

      {/* Glow effect on hover */}
      {glow && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${colorData.stroke}40 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
};

export default ProgressRing;