'use client';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ebony text-gray-100">
      <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified.
        </p>
        <button
          onClick={resetError}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}