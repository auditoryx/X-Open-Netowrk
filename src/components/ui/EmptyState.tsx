import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  illustration?: React.ReactNode;
  className?: string;
}

const DefaultIllustration = () => (
  <motion.div 
    className="w-48 h-48 mx-auto mb-8 relative"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {/* Search glass illustration */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ 
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1] 
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="w-32 h-32 border-8 border-white rounded-full relative">
        <div className="absolute -bottom-6 -right-6 w-16 h-8 bg-white transform rotate-45 rounded-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="text-4xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            🔍
          </motion.div>
        </div>
      </div>
    </motion.div>
    
    {/* Floating elements */}
    <motion.div
      className="absolute top-4 right-8 text-2xl"
      animate={{ 
        y: [-10, 10, -10],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🎵
    </motion.div>
    
    <motion.div
      className="absolute bottom-8 left-4 text-xl"
      animate={{ 
        y: [10, -10, 10],
        rotate: [0, -10, 10, 0]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    >
      🎤
    </motion.div>
    
    <motion.div
      className="absolute top-16 left-12 text-lg"
      animate={{ 
        y: [-5, 15, -5],
        rotate: [0, 15, -15, 0]
      }}
      transition={{ 
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    >
      🎧
    </motion.div>
  </motion.div>
);

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  illustration,
  className = ''
}: EmptyStateProps) {
  return (
    <motion.div 
      className={`text-center py-16 px-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {illustration || <DefaultIllustration />}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="heading-brutalist-lg mb-6">{title}</h3>
        <p className="text-brutalist-mono opacity-80 mb-8 max-w-md mx-auto">
          {description}
        </p>
        
        {actionText && actionHref && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link 
              href={actionHref}
              className="btn-brutalist inline-block"
            >
              {actionText}
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Specific empty state variants
export const NoResultsEmpty = ({ searchQuery }: { searchQuery?: string }) => (
  <EmptyState
    title="NO CREATORS FOUND"
    description={searchQuery 
      ? `No creators match "${searchQuery}". Try adjusting your filters or search terms.`
      : "No creators match your current filters. Try broadening your search criteria."
    }
    actionText="CLEAR FILTERS"
    actionHref="/explore"
  />
);

export const NoServicesEmpty = () => (
  <EmptyState
    title="NO SERVICES AVAILABLE"
    description="This creator hasn't listed any services yet. Check back later or explore other creators."
    actionText="EXPLORE CREATORS"
    actionHref="/explore"
    illustration={
      <div className="w-48 h-48 mx-auto mb-8 flex items-center justify-center">
        <motion.div
          className="text-8xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎵
        </motion.div>
      </div>
    }
  />
);

export const LoadingEmpty = () => (
  <motion.div 
    className="text-center py-16 px-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div 
      className="w-16 h-16 mx-auto mb-6 border-4 border-white border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <p className="text-brutalist-mono opacity-60">LOADING CREATORS...</p>
  </motion.div>
);