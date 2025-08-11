import React, { useEffect, useState } from 'react';
import { useAnimatedText } from '@/hooks/useLoadingState';

interface AdvancedLoaderProps {
  isLoading?: boolean;
  text?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'dots' | 'spinner' | 'text' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AdvancedLoader: React.FC<AdvancedLoaderProps> = ({
  isLoading = true,
  text = 'Loading...',
  progress = 0,
  showProgress = false,
  variant = 'text',
  size = 'md',
  className = '',
}) => {
  const { animatedText, isComplete } = useAnimatedText(text, { 
    delay: 50, 
    enabled: isLoading && variant === 'text' 
  });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (!isLoading) return null;

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-white rounded-full animate-loading-dots"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderSpinner = () => (
    <div className="relative">
      <svg 
        className="animate-spin h-6 w-6 text-white" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const renderTextLoader = () => (
    <div className="space-y-3">
      <div className={`font-mono ${sizeClasses[size]} text-white`}>
        {animatedText}
        {!isComplete && (
          <span className="inline-block w-2 h-5 bg-white ml-1 animate-loading-pulse" />
        )}
      </div>
      {showProgress && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className="bg-brand-500 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
      <span className="text-sm text-gray-300 font-mono">{text}</span>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'spinner':
        return renderSpinner();
      case 'text':
        return renderTextLoader();
      case 'minimal':
        return renderMinimal();
      default:
        return renderTextLoader();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderContent()}
    </div>
  );
};

export default AdvancedLoader;