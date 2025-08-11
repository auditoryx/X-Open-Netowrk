'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressIndicator from './ProgressIndicator';
import FormStep from './FormStep';

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepComponentProps>;
  validation?: (data: any) => boolean | Promise<boolean>;
  canSkip?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export interface StepComponentProps {
  data: any;
  updateData: (updates: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  isActive: boolean;
  isCompleted: boolean;
}

interface MultiStepFormProps {
  steps: StepConfig[];
  initialData?: any;
  onComplete: (data: any) => void | Promise<void>;
  onStepChange?: (currentStep: number, data: any) => void;
  allowNavigation?: boolean;
  showProgress?: boolean;
  className?: string;
  submitLabel?: string;
  loadingLabel?: string;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  initialData = {},
  onComplete,
  onStepChange,
  allowNavigation = true,
  showProgress = true,
  className = '',
  submitLabel = 'Complete',
  loadingLabel = 'Processing...',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // Update data for current step
  const updateData = useCallback((updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    const step = steps[currentStep];
    if (step?.validation) {
      try {
        const isValid = await step.validation(formData);
        setCanProceed(isValid);
        return isValid;
      } catch (error) {
        console.error('Step validation error:', error);
        setCanProceed(false);
        return false;
      }
    }
    setCanProceed(true);
    return true;
  }, [currentStep, formData, steps]);

  // Effect to validate when data changes
  useEffect(() => {
    validateCurrentStep();
  }, [validateCurrentStep]);

  // Effect to notify parent of step changes
  useEffect(() => {
    onStepChange?.(currentStep, formData);
  }, [currentStep, formData, onStepChange]);

  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    // If moving forward, validate current step first
    if (stepIndex > currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid && !steps[currentStep]?.canSkip) return;
      
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }

    setCurrentStep(stepIndex);
  }, [currentStep, steps, validateCurrentStep]);

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, goToStep]);

  const goPrevious = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(async () => {
    // Validate final step
    const isValid = await validateCurrentStep();
    if (!isValid && !steps[currentStep]?.canSkip) return;

    setIsSubmitting(true);
    try {
      await onComplete(formData);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, onComplete, steps, validateCurrentStep]);

  const isLastStep = currentStep === steps.length - 1;
  const currentStepConfig = steps[currentStep];

  // Prepare steps for progress indicator
  const progressSteps = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    isCompleted: completedSteps.has(index),
    isCurrent: index === currentStep,
  }));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };

  const progressVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  if (!currentStepConfig) {
    return (
      <div className="text-center text-red-400 p-8">
        Error: Invalid step configuration
      </div>
    );
  }

  const StepComponent = currentStepConfig.component;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`max-w-4xl mx-auto ${className}`}
    >
      {/* Progress Indicator */}
      {showProgress && (
        <motion.div
          variants={progressVariants}
          className="mb-8"
        >
          <ProgressIndicator
            steps={progressSteps}
            variant="horizontal"
            showLabels={true}
          />
        </motion.div>
      )}

      {/* Form Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <FormStep
            key={currentStep}
            title={currentStepConfig.title}
            description={currentStepConfig.description}
            isActive={true}
            isCompleted={completedSteps.has(currentStep)}
            onNext={isLastStep ? undefined : goNext}
            onPrevious={currentStep > 0 && allowNavigation ? goPrevious : undefined}
            canProceed={canProceed}
            showNavigation={false} // We'll handle navigation separately
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8"
          >
            <StepComponent
              data={formData}
              updateData={updateData}
              onNext={goNext}
              onPrevious={goPrevious}
              canProceed={canProceed}
              isActive={true}
              isCompleted={completedSteps.has(currentStep)}
            />
          </FormStep>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          {currentStep > 0 && allowNavigation && (
            <motion.button
              type="button"
              onClick={goPrevious}
              className="
                px-6 py-2.5 text-gray-400 hover:text-white
                border border-gray-600 hover:border-gray-500
                rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black
              "
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentStepConfig.previousLabel || 'Previous'}
            </motion.button>
          )}
        </div>

        <div>
          {isLastStep ? (
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className={`
                px-8 py-2.5 font-semibold rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                ${canProceed && !isSubmitting
                  ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
              whileHover={canProceed && !isSubmitting ? { scale: 1.02, y: -1 } : undefined}
              whileTap={canProceed && !isSubmitting ? { scale: 0.98 } : undefined}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {loadingLabel}
                </span>
              ) : submitLabel}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={`
                px-8 py-2.5 font-semibold rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                ${canProceed 
                  ? 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
              whileHover={canProceed ? { scale: 1.02, y: -1 } : undefined}
              whileTap={canProceed ? { scale: 0.98 } : undefined}
            >
              {currentStepConfig.nextLabel || 'Next'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiStepForm;