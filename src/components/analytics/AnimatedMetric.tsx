'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Target, Clock } from 'lucide-react';

interface AnimatedMetricProps {
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  icon?: LucideIcon;
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes';
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray' | 'cyan' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  delay?: number;
  duration?: number;
  showProgress?: boolean;
  showTrend?: boolean;
  showTarget?: boolean;
  className?: string;
  onClick?: () => void;
  suffix?: string;
  prefix?: string;
  precision?: number;
  threshold?: number;
  thresholdLabel?: string;
  loading?: boolean;
  sparklineData?: number[];
}

const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  label,
  value,
  previousValue,
  target,
  icon: Icon,
  format = 'number',
  color = 'blue',
  size = 'md',
  animate = true,
  delay = 0,
  duration = 1000,
  showProgress = false,
  showTrend = true,
  showTarget = false,
  className = '',
  onClick,
  suffix = '',
  prefix = '',
  precision = 1,
  threshold,
  thresholdLabel = 'Target',
  loading = false,
  sparklineData = [],
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  // Calculate trend
  const trend = previousValue !== undefined ? 
    ((value - previousValue) / previousValue) * 100 : undefined;

  // Calculate progress
  const progress = target ? Math.min((value / target) * 100, 100) : 0;

  // Animated number counting
  useEffect(() => {
    if (!animate || !isInView) return;

    let startTime: number;
    const startValue = 0;
    const endValue = value;

    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progressRatio = Math.min(timeElapsed / duration, 1);
      
      // Ease-out cubic animation
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(currentValue);
      
      if (progressRatio < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, animate, delay, duration, isInView]);

  // Container animation
  useEffect(() => {
    if (isInView && animate) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          delay: delay / 1000,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      });
    }
  }, [isInView, controls, animate, delay]);

  const formatValue = (val: number) => {
    const displayVal = animate ? displayValue : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: displayVal >= 1000 ? 0 : 2,
        }).format(displayVal);
      case 'percentage':
        return `${displayVal.toFixed(precision)}%`;
      case 'duration':
        const hours = Math.floor(displayVal / 3600);
        const minutes = Math.floor((displayVal % 3600) / 60);
        const seconds = Math.floor(displayVal % 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
      case 'bytes':
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = displayVal;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }
        return `${size.toFixed(precision)} ${units[unitIndex]}`;
      case 'number':
      default:
        let formattedNumber;
        if (displayVal >= 1000000) {
          formattedNumber = `${(displayVal / 1000000).toFixed(precision)}M`;
        } else if (displayVal >= 1000) {
          formattedNumber = `${(displayVal / 1000).toFixed(precision)}K`;
        } else {
          formattedNumber = displayVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: precision,
          });
        }
        return `${prefix}${formattedNumber}${suffix}`;
    }
  };

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/20',
        progress: 'bg-gradient-to-r from-blue-500 to-blue-600',
      },
      green: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/20',
        glow: 'shadow-green-500/20',
        progress: 'bg-gradient-to-r from-green-500 to-green-600',
      },
      purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        glow: 'shadow-purple-500/20',
        progress: 'bg-gradient-to-r from-purple-500 to-purple-600',
      },
      yellow: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/20',
        glow: 'shadow-yellow-500/20',
        progress: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      },
      red: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        glow: 'shadow-red-500/20',
        progress: 'bg-gradient-to-r from-red-500 to-red-600',
      },
      gray: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/20',
        glow: 'shadow-gray-500/20',
        progress: 'bg-gradient-to-r from-gray-500 to-gray-600',
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
        glow: 'shadow-cyan-500/20',
        progress: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      },
      orange: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        glow: 'shadow-orange-500/20',
        progress: 'bg-gradient-to-r from-orange-500 to-orange-600',
      },
    };
    
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'w-4 h-4',
          iconContainer: 'p-2',
          title: 'text-xs',
          value: 'text-lg',
          trend: 'text-xs',
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'w-8 h-8',
          iconContainer: 'p-3',
          title: 'text-base',
          value: 'text-4xl',
          trend: 'text-sm',
        };
      case 'xl':
        return {
          container: 'p-10',
          icon: 'w-10 h-10',
          iconContainer: 'p-4',
          title: 'text-lg',
          value: 'text-5xl',
          trend: 'text-base',
        };
      case 'md':
      default:
        return {
          container: 'p-6',
          icon: 'w-6 h-6',
          iconContainer: 'p-2.5',
          title: 'text-sm',
          value: 'text-3xl',
          trend: 'text-sm',
        };
    }
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (trend === undefined) return null;
    
    const absChange = Math.abs(trend);
    const changeText = `${absChange.toFixed(precision)}%`;
    
    if (trend > 0) return <span className="text-green-400">+{changeText}</span>;
    if (trend < 0) return <span className="text-red-400">-{changeText}</span>;
    return <span className="text-gray-400">{changeText}</span>;
  };

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <motion.div
        ref={ref}
        initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : {}}
        animate={animate ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        className={`bg-neutral-800/50 border border-neutral-700/50 rounded-xl 
          ${sizeClasses.container} backdrop-blur-sm ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${colorClasses.bg} rounded-lg ${sizeClasses.iconContainer}`}>
                <div className={`${sizeClasses.icon} bg-gray-600 rounded animate-pulse`}></div>
              </div>
              <div className={`h-4 bg-gray-600 rounded w-20`}></div>
            </div>
          </div>
          <div className={`h-8 bg-gray-600 rounded w-24`}></div>
          <div className={`h-4 bg-gray-600 rounded w-16`}></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : {}}
      animate={controls}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 20px 40px -10px ${colorClasses.glow}`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`bg-neutral-800/50 border ${colorClasses.border} rounded-xl 
        ${sizeClasses.container} backdrop-blur-sm hover:bg-neutral-700/50 
        transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`${colorClasses.bg} rounded-lg ${sizeClasses.iconContainer} 
                  group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`${sizeClasses.icon} ${colorClasses.text}`} />
              </motion.div>
            )}
            <h3 className={`${sizeClasses.title} font-medium text-gray-300 
              group-hover:text-white transition-colors`}>
              {label}
            </h3>
          </div>

          {showTarget && target && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              <span>{formatValue(target)}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-2">
          <motion.p 
            className={`${sizeClasses.value} font-bold text-white`}
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(value)}
          </motion.p>

          {/* Progress Bar */}
          {showProgress && target && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ 
                    duration: 1.2, 
                    delay: (delay + 200) / 1000,
                    ease: "easeOut",
                  }}
                  className={`${colorClasses.progress} h-2 rounded-full relative overflow-hidden`}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: (delay + 800) / 1000,
                    }}
                  />
                </motion.div>
              </div>
            </div>
          )}

          {/* Trend */}
          {showTrend && trend !== undefined && (
            <div className={`flex items-center gap-2 ${sizeClasses.trend}`}>
              {getTrendIcon()}
              <span>
                {getTrendText()}
                <span className="text-gray-400 ml-1">vs last period</span>
              </span>
            </div>
          )}

          {/* Threshold indicator */}
          {threshold && (
            <div className={`flex items-center gap-2 ${sizeClasses.trend} ${
              value >= threshold ? 'text-green-400' : 'text-yellow-400'
            }`}>
              <Target className="w-4 h-4" />
              <span>
                {value >= threshold ? 'Above' : 'Below'} {thresholdLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedMetric;