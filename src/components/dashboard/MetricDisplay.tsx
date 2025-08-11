'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Target, Clock, Users, DollarSign } from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  color?: string;
  trend?: number;
  trendLabel?: string;
}

interface MetricDisplayProps {
  title?: string;
  metrics: MetricData[];
  layout?: 'grid' | 'list' | 'compact';
  animate?: boolean;
  delay?: number;
  showProgress?: boolean;
  showTrends?: boolean;
  showTargets?: boolean;
  className?: string;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  title,
  metrics,
  layout = 'grid',
  animate = true,
  delay = 0,
  showProgress = true,
  showTrends = true,
  showTargets = true,
  className = '',
  interactive = true,
  size = 'md',
  variant = 'default',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView && animate) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          delay: delay / 1000,
          staggerChildren: 0.1,
        },
      });
    }
  }, [isInView, controls, animate, delay]);

  const formatValue = (value: number, format: string = 'number', unit: string = '') => {
    let formattedValue: string;

    switch (format) {
      case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
        break;
      case 'percentage':
        formattedValue = `${value.toFixed(1)}%`;
        break;
      case 'duration':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        formattedValue = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        break;
      case 'number':
      default:
        if (value >= 1000000) {
          formattedValue = `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          formattedValue = `${(value / 1000).toFixed(1)}K`;
        } else {
          formattedValue = value.toLocaleString();
        }
        break;
    }

    return unit ? `${formattedValue}${unit}` : formattedValue;
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400';
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          title: 'text-base',
          value: 'text-lg',
          label: 'text-xs',
        };
      case 'lg':
        return {
          container: 'p-8',
          title: 'text-xl',
          value: 'text-3xl',
          label: 'text-sm',
        };
      case 'md':
      default:
        return {
          container: 'p-6',
          title: 'text-lg',
          value: 'text-2xl',
          label: 'text-sm',
        };
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'list':
        return 'space-y-4';
      case 'compact':
        return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid':
      default:
        return `grid grid-cols-1 ${metrics.length > 1 ? 'md:grid-cols-2' : ''} ${metrics.length > 2 ? 'lg:grid-cols-3' : ''} gap-6`;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border-0';
      case 'card':
        return 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg';
      case 'default':
      default:
        return 'bg-neutral-800/50 border border-neutral-700/50 backdrop-blur-sm';
    }
  };

  const sizeClasses = getSizeClasses();
  const layoutClasses = getLayoutClasses();
  const variantClasses = getVariantClasses();

  const MetricItem: React.FC<{ metric: MetricData; index: number }> = ({ metric, index }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const progressPercentage = getProgressPercentage(metric.value, metric.target);

    // Animated counter
    useEffect(() => {
      if (!animate) return;

      let startTime: number;
      const duration = 1000;
      const startValue = 0;
      const endValue = metric.value;

      const animateCount = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animateCount);
      }, delay + (index * 100));

      return () => clearTimeout(timer);
    }, [metric.value, animate, delay, index]);

    const finalValue = animate ? displayValue : metric.value;

    if (layout === 'compact') {
      return (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className={`${variantClasses} rounded-lg ${sizeClasses.container} 
            ${interactive ? 'hover:scale-105 transition-transform cursor-pointer' : ''}`}
        >
          <div className="text-center">
            <p className={`${sizeClasses.value} font-bold text-white mb-1`}>
              {formatValue(finalValue, metric.format, metric.unit)}
            </p>
            <p className={`${sizeClasses.label} text-gray-400`}>{metric.label}</p>
            {showTrends && metric.trend && (
              <div className={`flex items-center justify-center gap-1 mt-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                <span className="text-xs">
                  {Math.abs(metric.trend)}%
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className={`${variantClasses} rounded-xl ${sizeClasses.container} 
          ${interactive ? 'hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer' : ''}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`${sizeClasses.label} font-medium text-gray-300`}>
              {metric.label}
            </h4>
            {showTargets && metric.target && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Target className="w-3 h-3" />
                <span>{formatValue(metric.target, metric.format, metric.unit)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className={`${sizeClasses.value} font-bold text-white`}>
              {formatValue(finalValue, metric.format, metric.unit)}
            </p>

            {showProgress && metric.target && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ 
                      duration: 1.2, 
                      delay: (delay + (index * 100) + 200) / 1000,
                      ease: "easeOut",
                    }}
                    className={`h-2 rounded-full ${
                      progressPercentage >= 100 ? 'bg-green-500' :
                      progressPercentage >= 75 ? 'bg-blue-500' :
                      progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {showTrends && metric.trend !== undefined && (
              <div className={`flex items-center gap-2 text-sm ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                <span>
                  {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                  {metric.trendLabel && (
                    <span className="text-gray-400 ml-1">{metric.trendLabel}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={animate ? "hidden" : "visible"}
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className={`space-y-6 ${className}`}
    >
      {title && (
        <motion.h3 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
          className={`${sizeClasses.title} font-semibold text-white`}
        >
          {title}
        </motion.h3>
      )}

      <div className={layoutClasses}>
        {metrics.map((metric, index) => (
          <MetricItem key={metric.label} metric={metric} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default MetricDisplay;