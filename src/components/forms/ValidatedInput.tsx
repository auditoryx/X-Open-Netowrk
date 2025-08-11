'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import ValidationMessage from './ValidationMessage';
import { FieldValidation } from '@/hooks/useFormValidation';

interface BaseValidatedInputProps {
  label?: string;
  description?: string;
  validation?: FieldValidation;
  showValidation?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
}

interface ValidatedInputProps extends BaseValidatedInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {}
interface ValidatedTextareaProps extends BaseValidatedInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
  label,
  description,
  validation,
  showValidation = true,
  className = '',
  containerClassName = '',
  labelClassName = '',
  id,
  ...props
}, ref) => {
  const hasError = validation?.error && !validation.isValidating;
  const hasWarning = validation?.warning && !validation.error && !validation.isValidating;
  const hasSuccess = validation?.isValid && !validation.isValidating && !hasWarning;

  const inputVariants = {
    idle: {
      borderColor: '#4B5563',
      boxShadow: 'none',
    },
    focus: {
      borderColor: '#8B5CF6',
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
    },
    error: {
      borderColor: '#EF4444',
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
    },
    warning: {
      borderColor: '#F59E0B',
      boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
    },
    success: {
      borderColor: '#10B981',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
    }
  };

  const labelVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const getCurrentVariant = () => {
    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    if (hasSuccess && props.value) return 'success';
    return 'idle';
  };

  return (
    <motion.div
      variants={labelVariants}
      initial="initial"
      animate="animate"
      className={`space-y-1 ${containerClassName}`}
    >
      {label && (
        <motion.label
          htmlFor={id}
          className={`
            block text-sm font-medium text-white
            ${labelClassName}
          `}
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </motion.label>
      )}

      <div className="relative">
        <motion.input
          ref={ref}
          id={id}
          variants={inputVariants}
          animate={getCurrentVariant()}
          whileFocus="focus"
          className={`
            w-full px-3 py-2 bg-gray-800 border rounded-lg
            text-white placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {/* Loading indicator */}
        {validation?.isValidating && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <svg className="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
        )}

        {/* Success indicator */}
        {hasSuccess && props.value && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </div>

      {description && (
        <motion.p
          className="text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>
      )}

      {/* Validation Messages */}
      {showValidation && (
        <div className="space-y-1">
          <ValidationMessage
            type="error"
            message={validation?.error || ''}
            visible={!!(hasError && validation?.error)}
          />
          <ValidationMessage
            type="warning"
            message={validation?.warning || ''}
            visible={!!(hasWarning && validation?.warning)}
          />
        </div>
      )}
    </motion.div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(({
  label,
  description,
  validation,
  showValidation = true,
  className = '',
  containerClassName = '',
  labelClassName = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const hasError = validation?.error && !validation.isValidating;
  const hasWarning = validation?.warning && !validation.error && !validation.isValidating;
  const hasSuccess = validation?.isValid && !validation.isValidating && !hasWarning;

  const textareaVariants = {
    idle: {
      borderColor: '#4B5563',
      boxShadow: 'none',
    },
    focus: {
      borderColor: '#8B5CF6',
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
    },
    error: {
      borderColor: '#EF4444',
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
    },
    warning: {
      borderColor: '#F59E0B',
      boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
    },
    success: {
      borderColor: '#10B981',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
    }
  };

  const getCurrentVariant = () => {
    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    if (hasSuccess && props.value) return 'success';
    return 'idle';
  };

  return (
    <motion.div
      className={`space-y-1 ${containerClassName}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-white
            ${labelClassName}
          `}
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <motion.textarea
          ref={ref}
          id={id}
          rows={rows}
          variants={textareaVariants}
          animate={getCurrentVariant()}
          whileFocus="focus"
          className={`
            w-full px-3 py-2 bg-gray-800 border rounded-lg
            text-white placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-0 resize-vertical
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {/* Loading indicator */}
        {validation?.isValidating && (
          <motion.div
            className="absolute right-3 top-3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <svg className="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
        )}
      </div>

      {description && (
        <motion.p
          className="text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>
      )}

      {/* Validation Messages */}
      {showValidation && (
        <div className="space-y-1">
          <ValidationMessage
            type="error"
            message={validation?.error || ''}
            visible={!!(hasError && validation?.error)}
          />
          <ValidationMessage
            type="warning"
            message={validation?.warning || ''}
            visible={!!(hasWarning && validation?.warning)}
          />
        </div>
      )}
    </motion.div>
  );
});

ValidatedTextarea.displayName = 'ValidatedTextarea';

export { ValidatedInput, ValidatedTextarea };