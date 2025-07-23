/**
 * Stripe Error Handler
 * Handles and formats Stripe API errors for user-friendly display
 */

export interface StripeErrorDetails {
  type: string;
  code?: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  actionRequired?: string;
}

export function handleStripeError(error: any): StripeErrorDetails {
  // Basic error handling for Stripe errors
  const errorCode = error.code || 'unknown_error';
  const errorType = error.type || 'api_error';
  
  let userMessage = 'An error occurred while processing your payment.';
  let retryable = false;
  let actionRequired = '';

  // Map common Stripe error codes to user-friendly messages
  switch (errorCode) {
    case 'card_declined':
      userMessage = 'Your card was declined. Please try a different payment method.';
      actionRequired = 'Try a different card or contact your bank.';
      break;
      
    case 'insufficient_funds':
      userMessage = 'Your card has insufficient funds.';
      actionRequired = 'Please check your account balance or try a different card.';
      break;
      
    case 'incorrect_cvc':
      userMessage = 'Your card\'s security code is incorrect.';
      retryable = true;
      actionRequired = 'Please check and re-enter your card\'s CVC.';
      break;
      
    case 'expired_card':
      userMessage = 'Your card has expired.';
      actionRequired = 'Please use a different card.';
      break;
      
    case 'processing_error':
      userMessage = 'An error occurred while processing your card.';
      retryable = true;
      actionRequired = 'Please try again in a moment.';
      break;
      
    default:
      userMessage = 'An unexpected error occurred.';
      retryable = true;
      actionRequired = 'Please try again or contact support if the problem persists.';
  }

  return {
    type: errorType,
    code: errorCode,
    message: error.message || 'Unknown error',
    userMessage,
    retryable,
    actionRequired
  };
}

export function formatErrorForUser(error: any): string {
  const errorDetails = handleStripeError(error);
  return errorDetails.userMessage;
}

export function isRetryableError(error: any): boolean {
  const errorDetails = handleStripeError(error);
  return errorDetails.retryable;
}