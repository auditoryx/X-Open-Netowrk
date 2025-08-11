'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  variant?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  variant = 'horizontal',
  showLabels = true,
  className = '',
}) => {
  const isHorizontal = variant === 'horizontal';
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const containerClasses = isHorizontal 
    ? 'flex items-center justify-between w-full'
    : 'flex flex-col space-y-4';

  const stepIndicatorVariants = {
    inactive: { 
      scale: 1, 
      backgroundColor: 'rgba(107, 114, 128, 0.3)',
      borderColor: 'rgba(107, 114, 128, 0.5)'
    },
    current: { 
      scale: 1.1, 
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8B5CF6'
    },
    completed: { 
      scale: 1.05, 
      backgroundColor: '#10B981',
      borderColor: '#10B981'
    }
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }
    }
  };

  const lineVariants = {
    inactive: { scaleX: 0 },
    active: { 
      scaleX: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Progress Bar Background (Horizontal only) */}
      {isHorizontal && (
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-700 -z-10">
          <motion.div
            className="h-full bg-brand-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className={containerClasses}>
        {steps.map((step, index) => (
          <div key={step.id} className={`relative flex ${isHorizontal ? 'flex-col items-center' : 'flex-row items-start'}`}>
            {/* Step Indicator Circle */}
            <motion.div
              variants={stepIndicatorVariants}
              animate={
                step.isCompleted ? 'completed' :
                step.isCurrent ? 'current' : 'inactive'
              }
              className={`
                relative flex items-center justify-center
                w-10 h-10 rounded-full border-2 z-10
                ${isHorizontal ? '' : 'mr-4'}
              `}
            >
              <AnimatePresence mode="wait">
                {step.isCompleted ? (
                  <motion.div
                    key="checkmark"
                    variants={checkmarkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <CheckIcon className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="number"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                      text-sm font-semibold
                      ${step.isCurrent ? 'text-brand-500' : 'text-gray-400'}
                    `}
                  >
                    {index + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step Label */}
            {showLabels && (
              <motion.div
                className={`
                  ${isHorizontal ? 'mt-2 text-center' : 'flex-1'}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`
                  text-sm font-medium
                  ${step.isCompleted ? 'text-green-400' :
                    step.isCurrent ? 'text-white' : 'text-gray-400'}
                `}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </motion.div>
            )}

            {/* Connecting Line (Vertical only) */}
            {!isHorizontal && index < steps.length - 1 && (
              <motion.div
                className="absolute left-5 top-10 w-0.5 h-8 bg-gray-700 origin-top"
                variants={lineVariants}
                animate={step.isCompleted ? 'active' : 'inactive'}
              />
            )}
          </div>
        ))}
      </div>

      {/* Overall Progress Text */}
      <motion.div
        className="mt-4 text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Step {Math.min(completedSteps + 1, totalSteps)} of {totalSteps}
      </motion.div>
    </div>
  );
};

export default ProgressIndicator;