'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, HomeIcon, MagnifyingGlassIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-rose/10 rounded-full blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Display */}
          <div className="mb-8 animate-fade-in">
            <div className="relative inline-block">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-extrabold text-gradient-brand leading-none select-none">
                404
              </h1>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent-amber rounded-2xl rotate-12 animate-float shadow-lg"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-accent-cyan rounded-xl -rotate-12 animate-float animation-delay-1000 shadow-lg"></div>
              <div className="absolute top-1/2 -right-12 w-6 h-6 bg-accent-rose rounded-full animate-bounce animation-delay-500"></div>
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-12 animate-slide-up space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              Track Not Found
            </h2>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Looks like this page hit a wrong note. Let's get you back to creating amazing music.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
            <button
              onClick={() => router.back()}
              className="btn-secondary btn-lg group"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>
            
            <Link href="/" className="btn-primary btn-lg group">
              <HomeIcon className="w-5 h-5 mr-2" />
              Home
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </Link>
            
            <Link href="/search" className="btn-outline btn-lg group">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Discover
            </Link>
          </div>

          {/* Quick navigation */}
          <div className="animate-fade-in animation-delay-300">
            <p className="text-sm text-gray-500 mb-6">Popular destinations:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <Link 
                href="/dashboard" 
                className="group p-4 bg-surface-tertiary hover:bg-surface-elevated border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="text-brand-400 mb-2">
                  <PlayIcon className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm font-medium text-white group-hover:text-brand-300">Dashboard</div>
              </Link>
              
              <Link 
                href="/booking" 
                className="group p-4 bg-surface-tertiary hover:bg-surface-elevated border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="text-accent-cyan mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white group-hover:text-accent-cyan">Book Session</div>
              </Link>
              
              <Link 
                href="/explore" 
                className="group p-4 bg-surface-tertiary hover:bg-surface-elevated border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="text-accent-emerald mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white group-hover:text-accent-emerald">Explore</div>
              </Link>
              
              <Link 
                href="/help" 
                className="group p-4 bg-surface-tertiary hover:bg-surface-elevated border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="text-accent-amber mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white group-hover:text-accent-amber">Help</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ambient light */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>
    </div>
  );
}
