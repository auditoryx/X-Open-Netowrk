import Stripe from 'stripe';
import { logger } from '@/lib/logger';

export interface StripeErrorResult {
  userMessage: string;
  retryable: boolean;
  category: 'card' | 'api' | 'network' | 'validation' | 'unknown';
  originalError?: string;
}

/**
 * Maps Stripe errors to user-friendly messages with retry guidance
 */
export function handleStripeError(error: any): StripeErrorResult {
  // Handle Stripe-specific errors
  if (error?.type === 'StripeError') {
    return handleStripeApiError(error);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return handleGenericError(error);
  }

  // Handle unknown error types
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    category: 'unknown',
    originalError: JSON.stringify(error)
  };
}

function handleStripeApiError(error: Stripe.StripeError): StripeErrorResult {
  const { type, code, message } = error;

  logger.error('Stripe API Error:', { type, code, message });

  switch (type) {
    case 'StripeCardError':
      return handleCardError(error as Stripe.errors.StripeCardError);
    
    case 'StripeRateLimitError':
      return {
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryable: true,
        category: 'api',
        originalError: message
      };
    
    case 'StripeInvalidRequestError':
      return handleInvalidRequestError(error as Stripe.errors.StripeInvalidRequestError);
    
    case 'StripeAPIError':
      return {
        userMessage: 'Payment service temporarily unavailable. Please try again in a few minutes.',
        retryable: true,
        category: 'api',
        originalError: message
      };
    
    case 'StripeConnectionError':
      return {
        userMessage: 'Connection issue. Please check your internet connection and try again.',
        retryable: true,
        category: 'network',
        originalError: message
      };
    
    case 'StripeAuthenticationError':
      return {
        userMessage: 'Payment configuration error. Please contact support.',
        retryable: false,
        category: 'api',
        originalError: message
      };
    
    default:
      return {
        userMessage: 'Payment processing error. Please try again or contact support.',
        retryable: true,
        category: 'unknown',
        originalError: message
      };
  }
}

function handleCardError(error: Stripe.errors.StripeCardError): StripeErrorResult {
  const { code, decline_code, message } = error;

  // Handle specific card error codes
  switch (code) {
    case 'card_declined':
      return handleCardDeclined(decline_code);
    
    case 'expired_card':
      return {
        userMessage: 'Your card has expired. Please use a different card or update your payment method.',
        retryable: false,
        category: 'card',
        originalError: message
      };
    
    case 'incorrect_cvc':
      return {
        userMessage: 'The security code (CVC) is incorrect. Please check and try again.',
        retryable: true,
        category: 'card',
        originalError: message
      };
    
    case 'insufficient_funds':
      return {
        userMessage: 'Insufficient funds. Please use a different card or add funds to your account.',
        retryable: false,
        category: 'card',
        originalError: message
      };
    
    case 'lost_card':
    case 'stolen_card':
      return {
        userMessage: 'This card cannot be used. Please contact your bank or use a different card.',
        retryable: false,
        category: 'card',
        originalError: message
      };
    
    case 'processing_error':
      return {
        userMessage: 'Your payment could not be processed. Please try again or use a different card.',
        retryable: true,
        category: 'card',
        originalError: message
      };
    
    default:
      return {
        userMessage: message || 'Your card was declined. Please try a different payment method.',
        retryable: true,
        category: 'card',
        originalError: message
      };
  }
}

function handleCardDeclined(decline_code?: string): StripeErrorResult {
  switch (decline_code) {
    case 'insufficient_funds':
      return {
        userMessage: 'Insufficient funds. Please use a different card or add funds to your account.',
        retryable: false,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'lost_card':
    case 'stolen_card':
      return {
        userMessage: 'This card has been reported as lost or stolen. Please use a different card.',
        retryable: false,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'expired_card':
      return {
        userMessage: 'Your card has expired. Please use a different card.',
        retryable: false,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'incorrect_cvc':
      return {
        userMessage: 'The security code is incorrect. Please check your card and try again.',
        retryable: true,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'card_not_supported':
      return {
        userMessage: 'This card type is not supported. Please use a different card.',
        retryable: false,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'currency_not_supported':
      return {
        userMessage: 'This card does not support the payment currency. Please use a different card.',
        retryable: false,
        category: 'card',
        originalError: `Card declined: ${decline_code}`
      };
    
    case 'do_not_honor':
    case 'generic_decline':
    default:
      return {
        userMessage: 'Your card was declined. Please contact your bank or try a different payment method.',
        retryable: true,
        category: 'card',
        originalError: `Card declined: ${decline_code || 'generic'}`
      };
  }
}

function handleInvalidRequestError(error: Stripe.errors.StripeInvalidRequestError): StripeErrorResult {
  const { code, param, message } = error;

  // Handle specific invalid request scenarios
  if (param === 'amount' || message?.includes('amount')) {
    return {
      userMessage: 'Invalid payment amount. Please refresh the page and try again.',
      retryable: true,
      category: 'validation',
      originalError: message
    };
  }

  if (param === 'currency' || message?.includes('currency')) {
    return {
      userMessage: 'Currency not supported. Please contact support.',
      retryable: false,
      category: 'validation',
      originalError: message
    };
  }

  if (message?.includes('customer')) {
    return {
      userMessage: 'Customer information error. Please refresh and try again.',
      retryable: true,
      category: 'validation',
      originalError: message
    };
  }

  return {
    userMessage: 'Invalid payment request. Please refresh the page and try again.',
    retryable: true,
    category: 'validation',
    originalError: message
  };
}

function handleGenericError(error: Error): StripeErrorResult {
  const message = error.message.toLowerCase();

  // Network-related errors
  if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    return {
      userMessage: 'Network error. Please check your connection and try again.',
      retryable: true,
      category: 'network',
      originalError: error.message
    };
  }

  // Validation errors
  if (message.includes('required') || message.includes('invalid') || message.includes('missing')) {
    return {
      userMessage: 'Invalid information provided. Please check your details and try again.',
      retryable: true,
      category: 'validation',
      originalError: error.message
    };
  }

  return {
    userMessage: 'An error occurred while processing your payment. Please try again.',
    retryable: true,
    category: 'unknown',
    originalError: error.message
  };
}

/**
 * Get suggested actions for the user based on error category
 */
export function getErrorActions(errorResult: StripeErrorResult): string[] {
  const actions: string[] = [];

  switch (errorResult.category) {
    case 'card':
      if (errorResult.retryable) {
        actions.push('Check your card details and try again');
        actions.push('Try a different payment method');
      } else {
        actions.push('Use a different card');
        actions.push('Contact your bank if you believe this is an error');
      }
      break;
    
    case 'network':
      actions.push('Check your internet connection');
      actions.push('Try again in a few moments');
      actions.push('Refresh the page and retry');
      break;
    
    case 'api':
      if (errorResult.retryable) {
        actions.push('Wait a moment and try again');
        actions.push('Refresh the page');
      } else {
        actions.push('Contact our support team');
      }
      break;
    
    case 'validation':
      actions.push('Check all required fields are filled correctly');
      actions.push('Refresh the page and start over');
      break;
    
    default:
      actions.push('Try again in a few moments');
      actions.push('Use a different payment method');
      actions.push('Contact support if the problem persists');
  }

  return actions;
}