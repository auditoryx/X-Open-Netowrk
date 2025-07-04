import * as Sentry from '@sentry/nextjs';

if (!Sentry.getCurrentHub().getClient()) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
