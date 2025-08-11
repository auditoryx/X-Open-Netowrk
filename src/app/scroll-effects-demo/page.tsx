// Simple Scroll Effects Demo - No Framer Motion useScroll
'use client';

import React, { useState, useEffect } from 'react';

export default function ScrollEffectsDemo() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Scroll Effects Demo...
          </h1>
          <p className="text-gray-300">Initializing advanced animations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="opacity-100 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scroll Effects Demo
            </h1>
          </div>
          
          <div className="opacity-100 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Experience the power of scroll-based animations and parallax effects.
              Phase 5 implementation of the UI Enhancement system.
            </p>
          </div>
          
          <div className="opacity-100 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <span>Scroll to Explore</span>
              <div className="animate-bounce">↓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Progress Demo */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Scroll Progress Tracking</h2>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)}%` }}
              />
            </div>
            <p className="text-gray-300">
              Progress: {Math.round(Math.min(100, (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100))}%
            </p>
          </div>
        </div>
      </section>

      {/* CSS Animation Demo */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">CSS-Based Animations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div 
                key={i} 
                className="bg-gray-800 p-6 rounded-lg opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 animate-pulse"></div>
                <h3 className="text-xl font-semibold mb-2">Feature {i + 1}</h3>
                <p className="text-gray-400">This card animates with CSS animations.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Text Demo with CSS Transform */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl font-bold opacity-10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          PARALLAX
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">CSS-Based Parallax</h2>
          <p className="text-lg md:text-xl text-gray-300">
            Different elements move at different speeds as you scroll,
            creating depth and visual interest using CSS transforms.
          </p>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Interactive Elements</h2>
          </div>

          <div className="space-y-12">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 md:p-8 rounded-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Hover Animation</h3>
              <p>This card scales on hover using CSS transitions.</p>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 md:p-8 rounded-lg animate-slide-in-left">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Slide from Left</h3>
              <p>This element slides in from the left using CSS animations.</p>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 md:p-8 rounded-lg animate-slide-in-right">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Slide from Right</h3>
              <p>This element slides in from the right using CSS animations.</p>
            </div>

            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 md:p-8 rounded-lg animate-rotate-in">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Rotate In</h3>
              <p>This element rotates and scales using CSS animations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Effects Demo */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="opacity-0 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Background Effects</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              CSS-based background effects with gradient animations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['CSS Gradients', 'Transforms', 'Transitions', 'Animations'].map((effect, index) => (
              <div 
                key={effect}
                className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 opacity-0 animate-fade-in-up hover:bg-black/70 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-2">{effect}</h3>
                <p className="text-gray-400 text-sm">Pure CSS {effect.toLowerCase()} effect</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Elements with CSS */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="opacity-0 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">CSS Floating Elements</h2>
            <p className="text-lg md:text-xl text-gray-300">
              Subtle floating animations using pure CSS keyframes.
            </p>
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="relative py-32 text-center">
        <div 
          className="max-w-4xl mx-auto px-4"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        >
          <div className="opacity-0 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Phase 5 Complete</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Advanced scroll-based animations and parallax effects are now live.
              Performance optimized and accessibility compliant using CSS.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 md:px-6 py-3 bg-green-600 rounded-lg text-sm md:text-base opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                ✅ Scroll Animations
              </div>
              <div className="px-4 md:px-6 py-3 bg-green-600 rounded-lg text-sm md:text-base opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                ✅ Parallax Effects
              </div>
              <div className="px-4 md:px-6 py-3 bg-green-600 rounded-lg text-sm md:text-base opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                ✅ Background Effects
              </div>
              <div className="px-4 md:px-6 py-3 bg-green-600 rounded-lg text-sm md:text-base opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                ✅ Performance Optimized
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes rotate-in {
          from { opacity: 0; transform: rotate(-10deg) scale(0.8); }
          to { opacity: 1; transform: rotate(0) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        .animate-rotate-in { animation: rotate-in 0.8s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite; 
        }
      `}</style>
    </div>
  );
}