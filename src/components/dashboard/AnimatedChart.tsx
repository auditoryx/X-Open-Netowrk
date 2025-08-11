'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';

interface AnimatedChartProps {
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  title?: string;
  colors?: string[];
  loading?: boolean;
  animate?: boolean;
  delay?: number;
  formatTooltip?: (value: any, name: string) => [string, string];
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  curve?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  gradient?: boolean;
  interactive?: boolean;
  threshold?: number;
  className?: string;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  type,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  yAxisKey,
  height = 300,
  title,
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'],
  loading = false,
  animate = true,
  delay = 0,
  formatTooltip,
  formatXAxis,
  formatYAxis,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  curve = 'monotone',
  gradient = true,
  interactive = true,
  threshold,
  className = '',
}) => {
  const [animationComplete, setAnimationComplete] = useState(!animate);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [animate, delay]);

  const defaultTooltipFormatter = (value: any, name: string) => {
    if (typeof value === 'number') {
      if (value > 1000000) {
        return [`${(value / 1000000).toFixed(1)}M`, name];
      } else if (value > 1000) {
        return [`${(value / 1000).toFixed(1)}K`, name];
      }
      return [value.toLocaleString(), name];
    }
    return [value, name];
  };

  const tooltipFormatter = formatTooltip || defaultTooltipFormatter;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && showTooltip) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-800/95 backdrop-blur-md border border-neutral-600 rounded-lg p-3 shadow-xl"
        >
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">
                {tooltipFormatter(entry.value, entry.name)[1]}:
              </span>
              <span className="text-white font-medium">
                {tooltipFormatter(entry.value, entry.name)[0]}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        className={`bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 backdrop-blur-sm ${className}`}
      >
        {title && (
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        )}
        <div className="animate-pulse">
          <div style={{ height }} className="bg-neutral-700/50 rounded-lg"></div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        className={`bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 backdrop-blur-sm ${className}`}
      >
        {title && (
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        )}
        <div 
          style={{ height }} 
          className="flex items-center justify-center bg-neutral-700/30 rounded-lg border border-dashed border-neutral-600"
        >
          <p className="text-gray-400">No data available</p>
        </div>
      </motion.div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      onMouseEnter: (_, index: number) => setHoveredIndex(index),
      onMouseLeave: () => setHoveredIndex(null),
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {threshold && (
              <ReferenceLine 
                y={threshold} 
                stroke="#F59E0B" 
                strokeDasharray="5 5"
                label={{ value: "Target", position: "insideTopRight" }}
              />
            )}
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]} 
              radius={[4, 4, 0, 0]}
              animationBegin={delay}
              animationDuration={animate ? 800 : 0}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {threshold && (
              <ReferenceLine 
                y={threshold} 
                stroke="#F59E0B" 
                strokeDasharray="5 5"
                label={{ value: "Target", position: "insideTopRight" }}
              />
            )}
            <Line 
              type={curve} 
              dataKey={dataKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ 
                fill: colors[0], 
                strokeWidth: 2, 
                r: 5,
                className: interactive ? 'hover:r-7 transition-all' : '',
              }}
              activeDot={{ 
                r: 8, 
                stroke: colors[0], 
                strokeWidth: 2,
                fill: '#FFFFFF',
              }}
              animationBegin={delay}
              animationDuration={animate ? 1000 : 0}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {gradient && (
                <linearGradient id={`colorGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.05}/>
                </linearGradient>
              )}
            </defs>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {threshold && (
              <ReferenceLine 
                y={threshold} 
                stroke="#F59E0B" 
                strokeDasharray="5 5"
                label={{ value: "Target", position: "insideTopRight" }}
              />
            )}
            <Area 
              type={curve} 
              dataKey={dataKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              fill={gradient ? `url(#colorGradient)` : colors[0]}
              fillOpacity={gradient ? 1 : 0.2}
              animationBegin={delay}
              animationDuration={animate ? 1000 : 0}
            />
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        const innerRadius = type === 'donut' ? Math.min(height / 4, 60) : 0;
        const outerRadius = Math.min(height / 3, 100);
        
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey={dataKey}
              nameKey={xAxisKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              animationBegin={delay}
              animationDuration={animate ? 800 : 0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  className={interactive ? 'hover:opacity-80 transition-opacity' : ''}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : {}}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 backdrop-blur-sm 
        hover:border-neutral-600/50 transition-all duration-300 ${className}`}
    >
      {title && (
        <motion.h3 
          initial={animate ? { opacity: 0, x: -20 } : {}}
          animate={animate ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: (delay + 200) / 1000 }}
          className="text-lg font-semibold text-white mb-6"
        >
          {title}
        </motion.h3>
      )}
      
      <AnimatePresence>
        {animationComplete && (
          <motion.div
            initial={animate ? { opacity: 0 } : {}}
            animate={animate ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            <ResponsiveContainer width="100%" height={height}>
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedChart;