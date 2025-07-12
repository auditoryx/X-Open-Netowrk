import * as Sentry from '@sentry/nextjs';

let sentryInitialized = false;

try {
  if (!sentryInitialized && (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      tracesSampleRate: 1.0,
    });
    sentryInitialized = true;
  }
} catch (error) {
  console.warn('Failed to initialize Sentry:', error);
}

export { Sentry };
