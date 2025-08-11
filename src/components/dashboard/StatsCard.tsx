'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // Percentage change
  changeLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray' | 'cyan' | 'orange';
  loading?: boolean;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  animate?: boolean;
  delay?: number;
  suffix?: string;
  prefix?: string;
  onClick?: () => void;
  href?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = 'blue',
  loading = false,
  format = 'number',
  animate = true,
  delay = 0,
  suffix = '',
  prefix = '',
  onClick,
  href,
  showProgress = false,
  progress = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();

  // Number counting animation
  useEffect(() => {
    if (!animate || typeof value !== 'number') return;

    let startTime: number;
    const duration = 1000; // 1 second animation
    const startValue = 0;
    const endValue = value;

    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, animate, delay]);

  // Card animation
  useEffect(() => {
    if (animate) {
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
  }, [controls, animate, delay]);

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return `${prefix}${val}${suffix}`;
    
    const displayVal = animate ? displayValue : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(displayVal);
      case 'percentage':
        return `${displayVal.toFixed(1)}%`;
      case 'duration':
        const hours = Math.floor(displayVal / 60);
        const minutes = displayVal % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'number':
      default:
        let formattedNumber;
        if (displayVal >= 1000000) {
          formattedNumber = `${(displayVal / 1000000).toFixed(1)}M`;
        } else if (displayVal >= 1000) {
          formattedNumber = `${(displayVal / 1000).toFixed(1)}K`;
        } else {
          formattedNumber = displayVal.toLocaleString();
        }
        return `${prefix}${formattedNumber}${suffix}`;
    }
  };

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        border: 'border-blue-500/20',
        progress: 'bg-blue-500',
      },
      green: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        glow: 'shadow-green-500/20',
        border: 'border-green-500/20',
        progress: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        border: 'border-purple-500/20',
        progress: 'bg-purple-500',
      },
      yellow: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20',
        border: 'border-yellow-500/20',
        progress: 'bg-yellow-500',
      },
      red: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        glow: 'shadow-red-500/20',
        border: 'border-red-500/20',
        progress: 'bg-red-500',
      },
      gray: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        glow: 'shadow-gray-500/20',
        border: 'border-gray-500/20',
        progress: 'bg-gray-500',
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/20',
        border: 'border-cyan-500/20',
        progress: 'bg-cyan-500',
      },
      orange: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        border: 'border-orange-500/20',
        progress: 'bg-orange-500',
      },
    };
    
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (change === undefined) return null;
    
    const absChange = Math.abs(change);
    const changeText = `${absChange.toFixed(1)}%`;
    
    if (change > 0) return <span className="text-green-400">+{changeText}</span>;
    if (change < 0) return <span className="text-red-400">-{changeText}</span>;
    return <span className="text-gray-400">{changeText}</span>;
  };

  const colorClasses = getColorClasses(color);
  const CardComponent = onClick || href ? motion.button : motion.div;

  if (loading) {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : {}}
        animate={animate ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{
          duration: 0.5,
          delay: delay / 1000,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 backdrop-blur-sm"
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${colorClasses.bg} rounded-lg`}>
                <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
          {(change !== undefined || changeLabel) && (
            <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <CardComponent
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : {}}
      animate={controls}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 10px 30px -5px ${colorClasses.glow}`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-neutral-800/50 border ${colorClasses.border} rounded-xl p-6 backdrop-blur-sm
        hover:bg-neutral-700/50 transition-all duration-300 group cursor-pointer
        ${onClick || href ? 'hover:border-opacity-100' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`p-2.5 ${colorClasses.bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-6 h-6 ${colorClasses.text}`} />
          </motion.div>
          <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-white">
          {formatValue(value)}
        </p>
        
        {(change !== undefined || changeLabel) && (
          <div className="flex items-center gap-2 text-sm">
            {getTrendIcon()}
            <span>
              {getTrendText()}
              {changeLabel && (
                <span className="text-gray-400 ml-1">{changeLabel}</span>
              )}
            </span>
          </div>
        )}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: (delay + 200) / 1000 }}
                className={`${colorClasses.progress} h-2 rounded-full`}
              />
            </div>
          </div>
        )}
      </div>
    </CardComponent>
  );
};

export default StatsCard;