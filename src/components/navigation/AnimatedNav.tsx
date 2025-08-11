'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimatedText } from '@/hooks/useLoadingState';

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface AnimatedNavProps {
  items: NavItem[];
  orientation?: 'horizontal' | 'vertical';
  showSelector?: boolean;
  className?: string;
  onItemClick?: (item: NavItem) => void;
}

const AnimatedNav: React.FC<AnimatedNavProps> = ({
  items,
  orientation = 'horizontal',
  showSelector = true,
  className = '',
  onItemClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(
    items.findIndex(item => item.isActive) || 0
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isHorizontal = orientation === 'horizontal';

  const containerClasses = isHorizontal 
    ? 'flex items-center space-x-1' 
    : 'flex flex-col space-y-1';

  const selectorMotion = {
    layout: true,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: isHorizontal ? 0 : 10, x: isHorizontal ? 10 : 0 },
    animate: { opacity: 1, y: 0, x: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <nav className={`relative ${className}`}>
      <div className={containerClasses}>
        {items.map((item, index) => (
          <NavLink
            key={item.href}
            item={item}
            index={index}
            isActive={index === activeIndex}
            isHovered={hoveredIndex === index}
            orientation={orientation}
            variants={itemVariants}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
            onClick={() => {
              setActiveIndex(index);
              onItemClick?.(item);
            }}
          />
        ))}
        
        {showSelector && (
          <SelectorArrow
            activeIndex={activeIndex}
            hoveredIndex={hoveredIndex}
            itemCount={items.length}
            orientation={orientation}
            motion={selectorMotion}
          />
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  item: NavItem;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  orientation: 'horizontal' | 'vertical';
  variants: any;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  item,
  index,
  isActive,
  isHovered,
  orientation,
  variants,
  onHover,
  onLeave,
  onClick,
}) => {
  const { animatedText, isComplete } = useAnimatedText(item.label, {
    delay: 100,
    enabled: isHovered || isActive,
  });

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <button
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={`
          relative px-4 py-2 font-mono text-sm tracking-wider transition-all duration-300
          ${isActive 
            ? 'text-brand-500 font-semibold' 
            : 'text-gray-300 hover:text-white'
          }
          ${orientation === 'vertical' ? 'w-full text-left' : ''}
        `}
      >
        <span className="relative z-10">
          {(isHovered || isActive) ? animatedText : item.label}
          {(isHovered || isActive) && !isComplete && (
            <motion.span
              className="inline-block w-px h-4 bg-brand-500 ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </span>
        
        {/* Background highlight */}
        <AnimatePresence>
          {(isActive || isHovered) && (
            <motion.div
              layoutId="nav-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`
                absolute inset-0 rounded-lg
                ${isActive 
                  ? 'bg-brand-500/10 border border-brand-500/20' 
                  : 'bg-gray-800/50'
                }
              `}
            />
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

interface SelectorArrowProps {
  activeIndex: number;
  hoveredIndex: number | null;
  itemCount: number;
  orientation: 'horizontal' | 'vertical';
  motion: any;
}

const SelectorArrow: React.FC<SelectorArrowProps> = ({
  activeIndex,
  hoveredIndex,
  itemCount,
  orientation,
  motion: motionProps,
}) => {
  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const isHorizontal = orientation === 'horizontal';
  
  const arrowPosition = isHorizontal
    ? { left: `${(targetIndex / itemCount) * 100}%` }
    : { top: `${(targetIndex / itemCount) * 100}%` };

  return (
    <motion.div
      {...motionProps}
      className={`
        absolute pointer-events-none
        ${isHorizontal 
          ? 'bottom-0 w-8 h-0.5 bg-brand-500' 
          : 'left-0 w-0.5 h-8 bg-brand-500'
        }
      `}
      style={arrowPosition}
    />
  );
};

export default AnimatedNav;