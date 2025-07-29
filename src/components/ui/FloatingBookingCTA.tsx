'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  HeartIcon,
  ShareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface FloatingBookingCTAProps {
  creatorId: string;
  creatorName: string;
  isAvailable?: boolean;
  startingPrice?: number;
  averageRating?: number;
  responseTime?: string;
  className?: string;
}

export default function FloatingBookingCTA({
  creatorId,
  creatorName,
  isAvailable = true,
  startingPrice,
  averageRating,
  responseTime,
  className = ''
}: FloatingBookingCTAProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA when user scrolls past the initial hero section
      const scrollPosition = window.scrollY;
      const shouldShow = scrollPosition > 300;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBooking = () => {
    router.push(`/book/${creatorId}`);
  };

  const handleMessage = () => {
    router.push(`/messages/new?recipient=${creatorId}`);
  };

  const toggleSaved = () => {
    setIsSaved(!isSaved);
    // Here you would also save to backend
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${creatorName} on AuditoryX`,
        text: `Check out ${creatorName} on AuditoryX`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        console.log("URL copied to clipboard as a fallback.");
      } catch (clipboardError) {
        console.error("Failed to copy URL to clipboard:", clipboardError);
        alert("Unable to share or copy the URL. Please try again.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed bottom-6 right-6 z-50 ${className}`}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Collapsed State */}
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                className="bg-brutalist-black border-4 border-white shadow-brutal-lg"
                initial={{ width: "auto" }}
                animate={{ width: "auto" }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 p-4">
                  <motion.button
                    onClick={handleBooking}
                    className="btn-brutalist text-sm px-6 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? '📅 Book Now' : '❌ Unavailable'}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setIsExpanded(true)}
                    className="p-3 bg-gray-800 border-2 border-gray-600 text-white hover:border-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg">⋯</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* Expanded State */
              <motion.div
                key="expanded"
                className="bg-brutalist-black border-4 border-white shadow-brutal-xl"
                initial={{ width: "auto", height: "auto" }}
                animate={{ width: 320, height: "auto" }}
                exit={{ width: "auto", height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-brutalist text-white font-black text-sm uppercase">
                      Quick Actions
                    </h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-white hover:text-gray-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Creator Info */}
                  <div className="mb-4 p-3 bg-gray-900 border-2 border-gray-700">
                    <p className="font-brutalist-mono text-white text-sm font-semibold">
                      {creatorName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {averageRating && (
                        <span>⭐ {averageRating.toFixed(1)}</span>
                      )}
                      {responseTime && (
                        <span>⚡ {responseTime}</span>
                      )}
                      {startingPrice && (
                        <span>💰 From ${startingPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleBooking}
                      className={`w-full flex items-center gap-3 p-3 border-2 transition-all font-brutalist-mono text-sm ${
                        isAvailable
                          ? 'bg-white text-black border-white hover:bg-gray-200'
                          : 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed'
                      }`}
                      whileHover={isAvailable ? { scale: 1.02 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      disabled={!isAvailable}
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span className="flex-1 text-left">
                        {isAvailable ? 'Book Session' : 'Unavailable'}
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={handleMessage}
                      className="w-full flex items-center gap-3 p-3 bg-transparent text-white border-2 border-gray-600 hover:border-white hover:bg-gray-800 transition-all font-brutalist-mono text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                      <span className="flex-1 text-left">Send Message</span>
                    </motion.button>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={toggleSaved}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 transition-all font-brutalist-mono text-sm ${
                          isSaved
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-transparent text-white border-gray-600 hover:border-red-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSaved ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                        <span className="text-xs">
                          {isSaved ? 'Saved' : 'Save'}
                        </span>
                      </motion.button>

                      <motion.button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-transparent text-white border-2 border-gray-600 hover:border-white hover:bg-gray-800 transition-all font-brutalist-mono text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShareIcon className="w-5 h-5" />
                        <span className="text-xs">Share</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}