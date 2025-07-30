'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console and Sentry
    console.error('Global error caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-ebony text-gray-100">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-red-400">
              Application Error
            </h1>
            <p className="text-gray-300 mb-4">
              Something unexpected happened. Our team has been notified.
            </p>
            <p className="text-sm text-gray-400 mb-6 font-mono">
              Error ID: {error.digest || 'UNKNOWN'}
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors"
                data-testid="smoke"
              >
                Try Again
              </button>
              <a
                href="/"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded transition-colors text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}