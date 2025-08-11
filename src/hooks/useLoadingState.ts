import { useState, useEffect, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  stage: 'idle' | 'loading' | 'complete' | 'error';
}

export interface UseLoadingStateOptions {
  duration?: number;
  stages?: string[];
  autoComplete?: boolean;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    duration = 2000,
    stages = ['Initializing...', 'Loading data...', 'Finalizing...'],
    autoComplete = false,
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    stage: 'idle',
  });

  const startLoading = useCallback((customMessage?: string) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: customMessage || stages[0] || 'Loading...',
      stage: 'loading',
    });

    if (autoComplete) {
      const stageInterval = duration / stages.length;
      let currentStage = 0;
      
      const interval = setInterval(() => {
        currentStage++;
        
        if (currentStage < stages.length) {
          const progress = (currentStage / stages.length) * 100;
          setLoadingState(prev => ({
            ...prev,
            progress,
            message: stages[currentStage],
          }));
        } else {
          setLoadingState(prev => ({
            ...prev,
            progress: 100,
            stage: 'complete',
          }));
          clearInterval(interval);
          
          // Auto-hide after completion
          setTimeout(() => {
            setLoadingState(prev => ({
              ...prev,
              isLoading: false,
              stage: 'idle',
            }));
          }, 500);
        }
      }, stageInterval);

      return () => clearInterval(interval);
    }
  }, [duration, stages, autoComplete]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message,
    }));
  }, []);

  const completeLoading = useCallback((message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: 100,
      message: message || 'Complete!',
      stage: 'complete',
    }));

    setTimeout(() => {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'idle',
      }));
    }, 500);
  }, []);

  const errorLoading = useCallback((message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      message: message || 'Error occurred',
      stage: 'error',
    }));
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      stage: 'idle',
    });
  }, []);

  return {
    loadingState,
    startLoading,
    updateProgress,
    completeLoading,
    errorLoading,
    resetLoading,
  };
}

export function useAnimatedText(text: string, options: { delay?: number; enabled?: boolean } = {}) {
  const { delay = 50, enabled = true } = options;
  const [animatedText, setAnimatedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setAnimatedText(text);
      setIsComplete(true);
      return;
    }

    setAnimatedText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setAnimatedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, delay);

      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, [text, delay, enabled]);

  return { animatedText, isComplete };
}