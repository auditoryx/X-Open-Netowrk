'use client';

import React, { useState } from 'react';
import AdvancedLoader from '@/components/ui/AdvancedLoader';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Typography from '@/components/ui/Typography';
import PageTransition from '@/components/ui/PageTransition';
import { useLoadingState } from '@/hooks/useLoadingState';

export default function UITestPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { loadingState, startLoading } = useLoadingState({
    stages: ['Initializing components...', 'Loading data...', 'Finalizing...'],
    autoComplete: true,
    duration: 3000,
  });

  const handleStartDemo = () => {
    setShowOverlay(true);
    startLoading();
    setTimeout(() => setShowOverlay(false), 3500);
  };

  const handlePageTransition = () => {
    setIsPageLoading(true);
    setTimeout(() => setIsPageLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <PageTransition isLoading={isPageLoading}>
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <Typography variant="h1" animate className="text-brand-500">
              UI Enhancement Demo
            </Typography>
            <Typography variant="body" animate animateDelay={0.3} className="text-gray-300">
              Showcasing the new Multiplayer Labs-inspired design system
            </Typography>
          </div>

          {/* Typography Showcase */}
          <section className="space-y-6">
            <Typography variant="h2" animate animateDelay={0.5}>
              Typography System
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Typography variant="h3">Heading Variants</Typography>
                <Typography variant="h4">H4 - Section Title</Typography>
                <Typography variant="body">
                  Body text with proper line height and spacing for optimal readability.
                </Typography>
                <Typography variant="caption">Caption text for metadata</Typography>
                <Typography variant="mono">Monospace for code: console.log('hello')</Typography>
              </div>
              <div className="space-y-4">
                <Typography variant="h3">Animated Text</Typography>
                <Typography variant="body" animate>
                  This text appears character by character with smooth animation.
                </Typography>
                <Typography variant="mono" animate animateDelay={1}>
                  const animation = 'smooth';
                </Typography>
              </div>
            </div>
          </section>

          {/* Loading Components Showcase */}
          <section className="space-y-6">
            <Typography variant="h2">Loading Components</Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Text Loader */}
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Text Loader</Typography>
                <AdvancedLoader
                  variant="text"
                  text="Loading data..."
                  progress={65}
                  showProgress
                />
              </div>

              {/* Dots Loader */}
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Dots Loader</Typography>
                <AdvancedLoader variant="dots" />
              </div>

              {/* Spinner Loader */}
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Spinner Loader</Typography>
                <AdvancedLoader variant="spinner" />
              </div>

              {/* Minimal Loader */}
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Minimal Loader</Typography>
                <AdvancedLoader variant="minimal" text="Processing..." />
              </div>
            </div>
          </section>

          {/* Interactive Demo */}
          <section className="space-y-6">
            <Typography variant="h2">Interactive Demos</Typography>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleStartDemo}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 animate-hover-lift"
              >
                Demo Loading Overlay
              </button>
              
              <button
                onClick={handlePageTransition}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 animate-hover-lift"
              >
                Demo Page Transition
              </button>
            </div>

            {loadingState.isLoading && (
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Auto-Loading Demo</Typography>
                <AdvancedLoader
                  text={loadingState.message}
                  progress={loadingState.progress}
                  showProgress
                />
              </div>
            )}
          </section>

          {/* Animation CSS Classes */}
          <section className="space-y-6">
            <Typography variant="h2">Animation Classes</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-hover-lift">
                <Typography variant="body">Hover Lift Effect</Typography>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-fade-in">
                <Typography variant="body">Fade In Animation</Typography>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-scale-in">
                <Typography variant="body">Scale In Animation</Typography>
              </div>
            </div>
          </section>
        </div>
      </PageTransition>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showOverlay}
        text="Loading amazing content..."
        progress={loadingState.progress}
        showProgress
        variant="blur"
      />
    </div>
  );
}