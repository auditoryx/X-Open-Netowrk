import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoading = false,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isLoading]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {shouldRender && (
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="animate-gpu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;