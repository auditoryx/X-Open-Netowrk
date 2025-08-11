'use client';

import React, { useState } from 'react';
import AdvancedLoader from '@/components/ui/AdvancedLoader';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Typography from '@/components/ui/Typography';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedNav from '@/components/navigation/AnimatedNav';
import HeroSection from '@/components/hero/HeroSection';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useLoadingState } from '@/hooks/useLoadingState';

export default function UITestPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { loadingState, startLoading } = useLoadingState({
    stages: ['Initializing components...', 'Loading data...', 'Finalizing...'],
    autoComplete: true,
    duration: 3000,
  });

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', isActive: true },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Projects', href: '/projects' },
    { label: 'Team', href: '/team' },
    { label: 'Settings', href: '/settings' },
  ];

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
    <div className="min-h-screen bg-black text-white">
      <PageTransition isLoading={isPageLoading}>
        {/* Hero Section */}
        <HeroSection
          title="UI Enhancement Demo"
          subtitle="Showcasing the new Multiplayer Labs-inspired design system"
          variant="minimal"
        >
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={handleStartDemo}
              animationType="glow"
            >
              Demo Loading Overlay
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              onClick={handlePageTransition}
              animationType="hover"
            >
              Demo Page Transition
            </AnimatedButton>
          </div>
        </HeroSection>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
          {/* Navigation Demo */}
          <section className="space-y-8">
            <Typography variant="h2">Navigation System</Typography>
            
            <div className="space-y-8">
              <div>
                <Typography variant="h3" className="mb-4">Horizontal Navigation</Typography>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                  <AnimatedNav
                    items={navItems}
                    orientation="horizontal"
                    onItemClick={(item) => console.log('Clicked:', item.label)}
                  />
                </div>
              </div>

              <div>
                <Typography variant="h3" className="mb-4">Vertical Navigation</Typography>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-xs">
                  <AnimatedNav
                    items={navItems}
                    orientation="vertical"
                    onItemClick={(item) => console.log('Clicked:', item.label)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Button Variants */}
          <section className="space-y-8">
            <Typography variant="h2">Button Components</Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Primary Buttons</Typography>
                <div className="space-y-3">
                  <AnimatedButton variant="primary" size="sm">Small Button</AnimatedButton>
                  <AnimatedButton variant="primary" size="md">Medium Button</AnimatedButton>
                  <AnimatedButton variant="primary" size="lg">Large Button</AnimatedButton>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Button Variants</Typography>
                <div className="space-y-3">
                  <AnimatedButton variant="secondary">Secondary</AnimatedButton>
                  <AnimatedButton variant="outline">Outline</AnimatedButton>
                  <AnimatedButton variant="ghost">Ghost</AnimatedButton>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Animation Types</Typography>
                <div className="space-y-3">
                  <AnimatedButton variant="primary" animationType="hover">Hover Effect</AnimatedButton>
                  <AnimatedButton variant="primary" animationType="glow">Glow Effect</AnimatedButton>
                  <AnimatedButton variant="primary" animationType="press">Press Effect</AnimatedButton>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Loading States</Typography>
                <div className="space-y-3">
                  <AnimatedButton variant="primary" isLoading>Loading...</AnimatedButton>
                  <AnimatedButton variant="secondary" disabled>Disabled</AnimatedButton>
                </div>
              </div>
            </div>
          </section>

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

          {/* Auto-Loading Demo */}
          {loadingState.isLoading && (
            <section className="space-y-6">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <Typography variant="h4" className="mb-4">Auto-Loading Demo</Typography>
                <AdvancedLoader
                  text={loadingState.message}
                  progress={loadingState.progress}
                  showProgress
                />
              </div>
            </section>
          )}

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