'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success';
  message: string;
  visible: boolean;
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  visible,
  className = '',
}) => {
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      x: -10,
      height: 0,
      marginTop: 0
    },
    visible: { 
      opacity: 1, 
      x: 0,
      height: 'auto',
      marginTop: '0.25rem',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      x: -10,
      height: 0,
      marginTop: 0,
      transition: {
        duration: 0.15,
        ease: 'easeIn'
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -8, 8, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {visible && message && (
        <motion.div
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`flex items-start gap-2 overflow-hidden ${className}`}
        >
          <motion.div
            variants={iconVariants}
            className="flex-shrink-0 mt-0.5"
          >
            {getIcon()}
          </motion.div>
          <motion.p
            variants={type === 'error' ? shakeVariants : undefined}
            animate={type === 'error' ? 'shake' : undefined}
            className={`text-sm leading-tight ${getTextColor()}`}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ValidationMessage;