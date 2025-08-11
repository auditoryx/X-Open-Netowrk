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
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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