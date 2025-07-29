'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function InteractiveHero() {
  return (
    <section className="relative text-center bg-brutalist-black border-b-4 border-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Network connections */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${20 + (i * 10)}%`}
              y1="20%"
              x2={`${80 - (i * 8)}%`}
              y2="80%"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 spacing-brutalist-xl">
        <motion.h1 
          className="heading-brutalist-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The Global Creative Network Built for Music
        </motion.h1>
        
        <motion.p 
          className="text-brutalist mb-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          BOOK TALENT, SELL YOUR SERVICES, AND GET PAID.
        </motion.p>
        
        <motion.div 
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Primary CTA */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/explore" 
              className="btn-brutalist-lg"
            >
              🔍 EXPLORE <AnimatedCounter target={10000} suffix="+" /> CREATORS
            </Link>
          </motion.div>
          
          <p className="text-brutalist-mono opacity-60">NO SIGNUP REQUIRED • BROWSE FREELY</p>
          
          {/* Secondary CTA */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/apply" 
              className="btn-brutalist-secondary"
            >
              I'M A CREATOR →
            </Link>
          </motion.div>
        </motion.div>

        {/* Live Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className="w-6 h-6 bg-white rounded-none"
              animate={{ 
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />
            <span className="text-brutalist-mono">
              <AnimatedCounter target={23} /> CREATORS JOINED TODAY
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className="w-6 h-6 bg-white rounded-none"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-brutalist-mono">
              <AnimatedCounter target={156} /> BOOKINGS THIS WEEK
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className="w-6 h-6 bg-white rounded-none"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-brutalist-mono">
              $<AnimatedCounter target={2.3} />M PAID OUT THIS MONTH
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}