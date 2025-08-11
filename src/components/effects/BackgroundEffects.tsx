'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BackgroundEffectsProps {
  children?: React.ReactNode;
  variant?: 'particles' | 'gradient' | 'mesh' | 'noise' | 'waves';
  intensity?: number;
  color?: string;
  speed?: number;
  className?: string;
  interactive?: boolean;
  disabled?: boolean;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  children,
  variant = 'particles',
  intensity = 1,
  color = '#3B82F6',
  speed = 1,
  className = '',
  interactive = false,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Mouse position for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth mouse tracking
  const springConfig = { damping: 25, stiffness: 700 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!interactive || !mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [interactive, mounted, mouseX, mouseY]);

  if (!mounted || disabled) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }

  const renderEffect = () => {
    switch (variant) {
      case 'particles':
        return <ParticleEffect intensity={intensity} color={color} speed={speed} mouseX={mouseXSpring} mouseY={mouseYSpring} />;
      case 'gradient':
        return <GradientEffect intensity={intensity} color={color} mouseX={mouseXSpring} mouseY={mouseYSpring} />;
      case 'mesh':
        return <MeshEffect intensity={intensity} color={color} speed={speed} />;
      case 'noise':
        return <NoiseEffect intensity={intensity} speed={speed} />;
      case 'waves':
        return <WaveEffect intensity={intensity} color={color} speed={speed} />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        {renderEffect()}
      </div>
      {children}
    </div>
  );
};

// Individual effect components
const ParticleEffect: React.FC<{
  intensity: number;
  color: string;
  speed: number;
  mouseX: any;
  mouseY: any;
}> = ({ intensity, color, speed, mouseX, mouseY }) => {
  const particleCount = Math.floor(50 * intensity);
  
  return (
    <div className="absolute inset-0">
      {Array.from({ length: particleCount }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-60"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const GradientEffect: React.FC<{
  intensity: number;
  color: string;
  mouseX: any;
  mouseY: any;
}> = ({ intensity, color, mouseX, mouseY }) => {
  const rotateX = useTransform(mouseY, [0, 1], [-10, 10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);
  
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, ${color}20 0%, transparent 70%)`,
        rotateX,
        rotateY,
        opacity: intensity * 0.8,
      }}
    />
  );
};

const MeshEffect: React.FC<{
  intensity: number;
  color: string;
  speed: number;
}> = ({ intensity, color, speed }) => {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="mesh" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 0,10 L 10,0 M 0,0 L 10,10"
              stroke={color}
              strokeWidth={0.5}
              opacity={intensity * 0.3}
              animate={{
                strokeDasharray: ["0,10", "5,5", "10,0"],
              }}
              transition={{
                duration: 2 / speed,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" />
      </svg>
    </div>
  );
};

const NoiseEffect: React.FC<{
  intensity: number;
  speed: number;
}> = ({ intensity, speed }) => {
  const [noiseOpacity, setNoiseOpacity] = useState(0.1);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoiseOpacity(0.05 + Math.random() * 0.1 * intensity);
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [intensity, speed]);

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-900 to-transparent"
      style={{
        opacity: noiseOpacity,
        filter: 'contrast(2) brightness(0.5)',
      }}
    />
  );
};

const WaveEffect: React.FC<{
  intensity: number;
  color: string;
  speed: number;
}> = ({ intensity, color, speed }) => {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
        <motion.path
          d="M 0,25 Q 25,5 50,25 T 100,25 L 100,50 L 0,50 Z"
          fill={color}
          opacity={intensity * 0.2}
          animate={{
            d: [
              "M 0,25 Q 25,5 50,25 T 100,25 L 100,50 L 0,50 Z",
              "M 0,25 Q 25,45 50,25 T 100,25 L 100,50 L 0,50 Z",
              "M 0,25 Q 25,5 50,25 T 100,25 L 100,50 L 0,50 Z",
            ],
          }}
          transition={{
            duration: 3 / speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};

// Floating elements effect
export const FloatingElements: React.FC<{
  count?: number;
  size?: number;
  color?: string;
  speed?: number;
  className?: string;
}> = ({
  count = 20,
  size = 4,
  color = '#3B82F6',
  speed = 1,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size + Math.random() * size,
            height: size + Math.random() * size,
            backgroundColor: color,
            opacity: 0.1 + Math.random() * 0.3,
          }}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 100,
          }}
          animate={{
            y: -100,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundEffects;