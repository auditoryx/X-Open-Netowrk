import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedLoader from './AdvancedLoader';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'blur' | 'solid' | 'minimal';
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = 'Loading...',
  progress = 0,
  showProgress = false,
  variant = 'blur',
  className = '',
}) => {
  const variants = {
    blur: 'bg-black/60 backdrop-blur-sm',
    solid: 'bg-black/90',
    minimal: 'bg-black/40',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            ${variants[variant]}
            ${className}
          `}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-900/90 rounded-2xl p-8 shadow-2xl border border-gray-800 min-w-[300px]"
          >
            <AdvancedLoader
              isLoading={true}
              text={text}
              progress={progress}
              showProgress={showProgress}
              variant="text"
              size="lg"
              className="animate-gpu"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;