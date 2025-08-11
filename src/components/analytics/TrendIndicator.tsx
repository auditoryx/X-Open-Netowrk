'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUp, 
  ArrowDown, 
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

interface TrendData {
  value: number;
  change: number;
  changePercent: number;
  period: string;
  isPositive?: boolean;
}

interface TrendIndicatorProps {
  label: string;
  current: number;
  previous: number;
  target?: number;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed' | 'compact';
  animate?: boolean;
  delay?: number;
  showTarget?: boolean;
  showChange?: boolean;
  showPercentage?: boolean;
  showSparkline?: boolean;
  sparklineData?: number[];
  className?: string;
  onClick?: () => void;
  period?: string;
  suffix?: string;
  prefix?: string;
  precision?: number;
  colorScheme?: 'default' | 'inverse' | 'neutral';
  threshold?: number;
  loading?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  label,
  current,
  previous,
  target,
  format = 'number',
  size = 'md',
  variant = 'default',
  animate = true,
  delay = 0,
  showTarget = false,
  showChange = true,
  showPercentage = true,
  showSparkline = false,
  sparklineData = [],
  className = '',
  onClick,
  period = 'vs last period',
  suffix = '',
  prefix = '',
  precision = 1,
  colorScheme = 'default',
  threshold,
  loading = false,
}) => {
  const [displayCurrent, setDisplayCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  // Calculate trend data
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  // Determine if trend is good based on context
  const isGoodTrend = colorScheme === 'inverse' ? !isPositive : isPositive;
  const reachedTarget = target ? current >= target : false;
  const targetProgress = target ? Math.min((current / target) * 100, 100) : 0;

  // Animated number counting
  useEffect(() => {
    if (!animate || !isInView) return;

    let startTime: number;
    const duration = 1000;
    const startValue = 0;
    const endValue = current;

    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayCurrent(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, delay);

    return () => clearTimeout(timer);
  }, [current, animate, delay, isInView]);

  // Container animation
  useEffect(() => {
    if (isInView && animate) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          delay: delay / 1000,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      });
    }
  }, [isInView, controls, animate, delay]);

  const formatValue = (val: number) => {
    const displayVal = animate ? displayCurrent : val;
    
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
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
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

  const getTrendIcon = () => {
    if (isNeutral) return <Minus className="w-4 h-4" />;
    
    switch (variant) {
      case 'minimal':
        return isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
      case 'detailed':
        return isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
      default:
        return isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (isNeutral) return 'text-gray-400';
    if (colorScheme === 'neutral') return 'text-gray-400';
    return isGoodTrend ? 'text-green-400' : 'text-red-400';
  };

  const getBorderColor = () => {
    if (isNeutral || colorScheme === 'neutral') return 'border-gray-500/20';
    return isGoodTrend ? 'border-green-500/20' : 'border-red-500/20';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          title: 'text-xs',
          value: 'text-lg',
          change: 'text-xs',
          icon: 'w-3 h-3',
        };
      case 'lg':
        return {
          container: 'p-6',
          title: 'text-base',
          value: 'text-3xl',
          change: 'text-sm',
          icon: 'w-5 h-5',
        };
      case 'md':
      default:
        return {
          container: 'p-4',
          title: 'text-sm',
          value: 'text-2xl',
          change: 'text-sm',
          icon: 'w-4 h-4',
        };
    }
  };

  const renderSparkline = () => {
    if (!showSparkline || sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min;
    
    const width = 60;
    const height = 20;
    
    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex items-center ml-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={getTrendColor()}
          />
        </svg>
      </div>
    );
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <motion.div
        ref={ref}
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        className={`bg-neutral-800/50 border border-neutral-700/50 rounded-lg 
          ${sizeClasses.container} backdrop-blur-sm ${className}`}
      >
        <div className="animate-pulse space-y-2">
          <div className={`h-3 bg-gray-600 rounded w-20`}></div>
          <div className={`h-6 bg-gray-600 rounded w-16`}></div>
          <div className={`h-3 bg-gray-600 rounded w-24`}></div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        ref={ref}
        initial={animate ? { opacity: 0, scale: 0.9 } : {}}
        animate={controls}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`flex items-center gap-3 bg-neutral-800/50 border ${getBorderColor()} 
          rounded-lg ${sizeClasses.container} backdrop-blur-sm hover:bg-neutral-700/50 
          transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className={getTrendColor()}>
            {getTrendIcon()}
          </div>
          <div>
            <p className={`${sizeClasses.title} text-gray-400`}>{label}</p>
            <p className={`${sizeClasses.value} font-bold text-white`}>
              {formatValue(current)}
            </p>
          </div>
        </div>
        
        {showChange && (
          <div className={`${sizeClasses.change} ${getTrendColor()}`}>
            {showPercentage ? (
              <span>{isPositive ? '+' : ''}{changePercent.toFixed(precision)}%</span>
            ) : (
              <span>{isPositive ? '+' : ''}{formatValue(change)}</span>
            )}
          </div>
        )}
        
        {renderSparkline()}
      </motion.div>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        ref={ref}
        initial={animate ? { opacity: 0, y: 10 } : {}}
        animate={controls}
        onClick={onClick}
        className={`flex items-center justify-between ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div>
          <p className={`${sizeClasses.title} text-gray-400`}>{label}</p>
          <p className={`${sizeClasses.value} font-bold text-white`}>
            {formatValue(current)}
          </p>
        </div>
        
        {showChange && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className={sizeClasses.change}>
              {showPercentage ? (
                <>{isPositive ? '+' : ''}{changePercent.toFixed(precision)}%</>
              ) : (
                <>{isPositive ? '+' : ''}{formatValue(change)}</>
              )}
            </span>
          </div>
        )}
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
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`bg-neutral-800/50 border ${getBorderColor()} rounded-lg 
        ${sizeClasses.container} backdrop-blur-sm hover:bg-neutral-700/50 
        transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className={`${sizeClasses.title} font-medium text-gray-300`}>{label}</p>
          {showTarget && target && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              <span>{formatValue(target)}</span>
            </div>
          )}
        </div>

        {/* Value and Change */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <motion.p 
              className={`${sizeClasses.value} font-bold text-white`}
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatValue(current)}
            </motion.p>
            
            {variant === 'detailed' && showTarget && target && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-full bg-neutral-700 rounded-full h-1 max-w-[80px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${targetProgress}%` }}
                    transition={{ duration: 1, delay: (delay + 200) / 1000 }}
                    className={`h-1 rounded-full ${
                      reachedTarget ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
                <span className="text-gray-400">{targetProgress.toFixed(0)}%</span>
              </div>
            )}
          </div>
          
          {showChange && (
            <div className="flex items-center gap-2">
              {renderSparkline()}
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <div className={`${sizeClasses.change} text-right`}>
                  {showPercentage && (
                    <div className="font-semibold">
                      {isPositive ? '+' : ''}{changePercent.toFixed(precision)}%
                    </div>
                  )}
                  <div className="text-xs opacity-75">
                    {isPositive ? '+' : ''}{formatValue(change)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Period */}
        {period && showChange && (
          <p className="text-xs text-gray-500">{period}</p>
        )}

        {/* Threshold indicator */}
        {threshold && (
          <div className={`flex items-center gap-2 text-xs ${
            current >= threshold ? 'text-green-400' : 'text-yellow-400'
          }`}>
            <Activity className="w-3 h-3" />
            <span>
              {current >= threshold ? 'Above' : 'Below'} threshold ({formatValue(threshold)})
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendIndicator;