'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Typography from '@/components/ui/Typography';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  showPattern?: boolean;
  variant?: 'dashboard' | 'landing' | 'minimal';
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  children,
  showPattern = true,
  variant = 'landing',
  className = '',
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dashboard':
        return 'py-12 md:py-16';
      case 'landing':
        return 'py-20 md:py-32 lg:py-40';
      case 'minimal':
        return 'py-8 md:py-12';
      default:
        return 'py-20 md:py-32';
    }
  };

  return (
    <section className={`relative overflow-hidden ${getVariantClasses()} ${className}`}>
      {/* Background Pattern */}
      {showPattern && <BackgroundPattern />}
      
      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-8">
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              animate
              className="text-white max-w-4xl mx-auto leading-tight"
            >
              {title}
            </Typography>
          </motion.div>

          {subtitle && (
            <motion.div variants={itemVariants}>
              <Typography
                variant="body"
                animate
                animateDelay={0.5}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
              >
                {subtitle}
              </Typography>
            </motion.div>
          )}

          {children && (
            <motion.div variants={itemVariants} className="pt-4">
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </section>
  );
};

const BackgroundPattern: React.FC = () => {
  // Use deterministic positions to avoid hydration mismatches
  const dotPositions = [
    { left: 15.5, top: 25.3 },
    { left: 78.2, top: 45.8 },
    { left: 35.9, top: 67.4 },
    { left: 92.1, top: 12.7 },
    { left: 48.6, top: 89.2 },
    { left: 65.3, top: 34.6 },
    { left: 23.7, top: 78.9 },
    { left: 87.4, top: 56.1 },
    { left: 41.8, top: 19.5 },
    { left: 74.2, top: 83.7 },
    { left: 28.9, top: 52.4 },
    { left: 95.6, top: 37.8 },
    { left: 52.1, top: 71.3 },
    { left: 18.4, top: 94.6 },
    { left: 83.7, top: 28.2 },
    { left: 39.3, top: 63.9 },
    { left: 76.8, top: 15.7 },
    { left: 31.5, top: 85.4 },
    { left: 89.2, top: 42.6 },
    { left: 56.7, top: 73.1 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Animated Dots */}
      <div className="absolute inset-0">
        {dotPositions.map((position, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-500 rounded-full"
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + (i % 3), // Deterministic duration based on index
              repeat: Infinity,
              delay: i * 0.2, // Deterministic delay based on index
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
    </div>
  );
};

export default HeroSection;