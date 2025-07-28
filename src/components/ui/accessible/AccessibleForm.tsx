/**
 * Accessible Form Components
 * 
 * WCAG 2.1 AA compliant form elements with comprehensive accessibility features
 */

'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useFormAnnouncements } from '@/lib/accessibility/screen-reader';
import { useAccessibleForm } from '@/lib/accessibility/aria-helpers';

// Base input styles
const inputVariants = cva(
  [
    'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
    'placeholder:text-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
    'contrast-more:border-black contrast-more:placeholder:text-gray-700',
  ],
  {
    variants: {
      variant: {
        default: '',
        error: 'border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Label component
export interface AccessibleLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

export const AccessibleLabel = forwardRef<HTMLLabelElement, AccessibleLabelProps>(
  ({ className = '', required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none text-gray-700 contrast-more:text-black ${className}`}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

AccessibleLabel.displayName = 'AccessibleLabel';

// Input field component
export interface AccessibleInputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  description?: string;
  success?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    className = '',
    variant,
    size,
    label,
    error,
    description,
    success,
    required,
    id,
    ...props
  }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;
    const successId = `${inputId}-success`;

    const { announceValidation } = useFormAnnouncements();

    // Announce validation changes
    React.useEffect(() => {
      if (error && label) {
        announceValidation({ field: label, error });
      } else if (success && label) {
        announceValidation({ field: label, success: true });
      }
    }, [error, success, label, announceValidation]);

    const finalVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <AccessibleLabel htmlFor={inputId} required={required}>
            {label}
          </AccessibleLabel>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputVariants({ variant: finalVariant, size, className })}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={[
            description ? descriptionId : '',
            error ? errorId : '',
            success ? successId : '',
          ].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        
        {description && (
          <p id={descriptionId} className="text-xs text-gray-600 contrast-more:text-gray-800">
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-xs text-red-600 contrast-more:text-red-800"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {success && (
          <p
            id={successId}
            className="text-xs text-green-600 contrast-more:text-green-800"
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Textarea component
export interface AccessibleTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  description?: string;
  success?: string;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({
    className = '',
    variant,
    label,
    error,
    description,
    success,
    required,
    id,
    ...props
  }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const descriptionId = `${textareaId}-description`;
    const successId = `${textareaId}-success`;

    const finalVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <AccessibleLabel htmlFor={textareaId} required={required}>
            {label}
          </AccessibleLabel>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={inputVariants({ variant: finalVariant, className })}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={[
            description ? descriptionId : '',
            error ? errorId : '',
            success ? successId : '',
          ].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        
        {description && (
          <p id={descriptionId} className="text-xs text-gray-600">
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {success && (
          <p
            id={successId}
            className="text-xs text-green-600"
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Select component
export interface AccessibleSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  description?: string;
  success?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({
    className = '',
    variant,
    size,
    label,
    error,
    description,
    success,
    required,
    options,
    placeholder,
    id,
    ...props
  }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const descriptionId = `${selectId}-description`;
    const successId = `${selectId}-success`;

    const finalVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <AccessibleLabel htmlFor={selectId} required={required}>
            {label}
          </AccessibleLabel>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={inputVariants({ variant: finalVariant, size, className })}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={[
            description ? descriptionId : '',
            error ? errorId : '',
            success ? successId : '',
          ].filter(Boolean).join(' ') || undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {description && (
          <p id={descriptionId} className="text-xs text-gray-600">
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {success && (
          <p
            id={successId}
            className="text-xs text-green-600"
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Checkbox component
export interface AccessibleCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ className = '', label, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const descriptionId = `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`
              mt-1 h-4 w-4 rounded border-gray-300 text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              contrast-more:border-black
              ${className}
            `}
            aria-describedby={[
              description ? descriptionId : '',
              error ? errorId : '',
            ].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            {...props}
          />
          <div className="flex-1">
            <AccessibleLabel htmlFor={checkboxId} className="text-sm font-normal">
              {label}
            </AccessibleLabel>
            {description && (
              <p id={descriptionId} className="text-xs text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <p
            id={errorId}
            className="text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// Radio group component
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface AccessibleRadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
}

export const AccessibleRadioGroup = forwardRef<HTMLFieldSetElement, AccessibleRadioGroupProps>(
  ({ name, options, value, onChange, label, error, description, required }, ref) => {
    const generatedId = useId();
    const groupId = `${generatedId}-group`;
    const descriptionId = `${groupId}-description`;
    const errorId = `${groupId}-error`;

    return (
      <fieldset
        ref={ref}
        className="space-y-4"
        aria-describedby={[
          description ? descriptionId : '',
          error ? errorId : '',
        ].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        aria-required={required}
      >
        {label && (
          <legend className="text-sm font-medium text-gray-700 contrast-more:text-black">
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </legend>
        )}
        
        {description && (
          <p id={descriptionId} className="text-xs text-gray-600">
            {description}
          </p>
        )}
        
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange?.(option.value)}
                disabled={option.disabled}
                className="
                  mt-1 h-4 w-4 border-gray-300 text-blue-600
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                  disabled:cursor-not-allowed disabled:opacity-50
                  contrast-more:border-black
                "
              />
              <div className="flex-1">
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm font-normal text-gray-700 contrast-more:text-black"
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-xs text-gray-600">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <p
            id={errorId}
            className="text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </fieldset>
    );
  }
);

AccessibleRadioGroup.displayName = 'AccessibleRadioGroup';