'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormStepProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
  showNavigation?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  className?: string;
}

const FormStep: React.FC<FormStepProps> = ({
  children,
  title,
  description,
  isActive,
  isCompleted,
  onNext,
  onPrevious,
  canProceed = true,
  showNavigation = true,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  className = '',
}) => {
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const navigationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form-step"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`relative w-full ${className}`}
      >
        {/* Step Header */}
        {(title || description) && (
          <motion.div
            variants={contentVariants}
            className="mb-8"
          >
            {title && (
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h2>
            )}
            {description && (
              <motion.p
                className="text-gray-400 text-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {description}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Step Content */}
        <motion.div
          variants={contentVariants}
          className="mb-8"
        >
          {children}
        </motion.div>

        {/* Navigation Buttons */}
        {showNavigation && (
          <motion.div
            variants={navigationVariants}
            className="flex items-center justify-between pt-6 border-t border-gray-800"
          >
            <div>
              {onPrevious && (
                <motion.button
                  type="button"
                  onClick={onPrevious}
                  className="
                    px-6 py-2.5 text-gray-400 hover:text-white
                    border border-gray-600 hover:border-gray-500
                    rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black
                  "
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {previousLabel}
                </motion.button>
              )}
            </div>

            <div>
              {onNext && (
                <motion.button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                  className={`
                    px-8 py-2.5 font-semibold rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                    ${canProceed 
                      ? 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  whileHover={canProceed ? { scale: 1.02, y: -1 } : undefined}
                  whileTap={canProceed ? { scale: 0.98 } : undefined}
                >
                  {nextLabel}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {isCompleted && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.3
            }}
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Step Background Effect */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default FormStep;