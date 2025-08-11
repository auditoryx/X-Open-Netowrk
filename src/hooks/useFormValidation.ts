import { useState, useCallback, useEffect } from 'react';

export interface ValidationRule {
  validate: (value: any, formData?: any) => boolean | Promise<boolean>;
  message: string;
  type?: 'error' | 'warning';
}

export interface FieldValidation {
  rules: ValidationRule[];
  isValid: boolean;
  error?: string;
  warning?: string;
  isValidating: boolean;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule[];
}

export interface FormValidationState {
  [fieldName: string]: FieldValidation;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFormValidation(
  config: FormValidationConfig,
  options: UseFormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize validation state for all fields
  useEffect(() => {
    const initialState: FormValidationState = {};
    Object.keys(config).forEach(fieldName => {
      initialState[fieldName] = {
        rules: config[fieldName],
        isValid: true,
        isValidating: false
      };
    });
    setValidationState(initialState);
  }, [config]);

  // Update form validity when validation state changes
  useEffect(() => {
    const allFieldsValid = Object.values(validationState).every(
      field => field.isValid && !field.isValidating
    );
    setIsFormValid(allFieldsValid);
  }, [validationState]);

  const validateField = useCallback(async (
    fieldName: string,
    value: any,
    formData?: any
  ): Promise<FieldValidation> => {
    const rules = config[fieldName];
    if (!rules) {
      return {
        rules,
        isValid: true,
        isValidating: false
      };
    }

    // Set validating state
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValidating: true
      }
    }));

    let isValid = true;
    let error: string | undefined;
    let warning: string | undefined;

    try {
      for (const rule of rules) {
        const ruleResult = await rule.validate(value, formData);
        if (!ruleResult) {
          isValid = false;
          if (rule.type === 'warning') {
            warning = rule.message;
          } else {
            error = rule.message;
            break; // Stop at first error
          }
        }
      }
    } catch (validationError) {
      isValid = false;
      error = 'Validation error occurred';
      console.error('Field validation error:', validationError);
    }

    const fieldValidation: FieldValidation = {
      rules,
      isValid,
      error,
      warning,
      isValidating: false
    };

    setValidationState(prev => ({
      ...prev,
      [fieldName]: fieldValidation
    }));

    return fieldValidation;
  }, [config]);

  const validateForm = useCallback(async (formData: any): Promise<boolean> => {
    const validationPromises = Object.keys(config).map(fieldName =>
      validateField(fieldName, formData[fieldName], formData)
    );

    const results = await Promise.all(validationPromises);
    return results.every(result => result.isValid);
  }, [config, validateField]);

  const clearFieldValidation = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValid: true,
        error: undefined,
        warning: undefined,
        isValidating: false
      }
    }));
  }, []);

  const clearAllValidation = useCallback(() => {
    setValidationState(prev => {
      const clearedState: FormValidationState = {};
      Object.keys(prev).forEach(fieldName => {
        clearedState[fieldName] = {
          ...prev[fieldName],
          isValid: true,
          error: undefined,
          warning: undefined,
          isValidating: false
        };
      });
      return clearedState;
    });
  }, []);

  // Debounced validation function
  const debouncedValidateField = useCallback(
    debounce(validateField, debounceMs),
    [validateField, debounceMs]
  );

  const getFieldProps = useCallback((fieldName: string) => {
    const fieldValidation = validationState[fieldName];
    
    return {
      'aria-invalid': fieldValidation ? !fieldValidation.isValid : false,
      'aria-describedby': fieldValidation?.error ? `${fieldName}-error` : undefined,
      onBlur: validateOnBlur 
        ? (e: any) => validateField(fieldName, e.target.value)
        : undefined,
      onChange: validateOnChange
        ? (e: any) => debouncedValidateField(fieldName, e.target.value)
        : undefined
    };
  }, [validationState, validateOnBlur, validateOnChange, validateField, debouncedValidateField]);

  return {
    validationState,
    isFormValid,
    validateField,
    validateForm,
    clearFieldValidation,
    clearAllValidation,
    getFieldProps
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Common validation rules
export const commonValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Don't validate if empty (use required rule for that)
      return value.toString().length >= min;
    },
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.toString().length <= max;
    },
    message: message || `Must be no more than ${max} characters`
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),

  number: (message = 'Please enter a valid number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return !isNaN(Number(value));
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: message || `Must be no more than ${max}`
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message
  }),

  custom: (
    validationFn: (value: any, formData?: any) => boolean | Promise<boolean>,
    message: string
  ): ValidationRule => ({
    validate: validationFn,
    message
  }),

  asyncUnique: (
    checkFn: (value: any) => Promise<boolean>,
    message = 'This value is already taken'
  ): ValidationRule => ({
    validate: async (value) => {
      if (!value) return true;
      return await checkFn(value);
    },
    message
  })
};