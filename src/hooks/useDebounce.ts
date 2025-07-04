import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * Useful for search inputs, API calls, and other scenarios where you want to delay execution
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Enhanced debounce hook with additional options
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean; // Execute immediately on first call
    trailing?: boolean; // Execute after delay (default)
    maxWait?: number; // Maximum time to wait
  } = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isFirstCall, setIsFirstCall] = useState(true);

  useEffect(() => {
    // Handle leading edge execution
    if (leading && isFirstCall) {
      setDebouncedValue(value);
      setIsFirstCall(false);
      return;
    }

    // Handle trailing edge execution
    if (trailing) {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, delay, leading, trailing, isFirstCall]);

  // Handle maxWait option
  useEffect(() => {
    if (maxWait) {
      const maxWaitHandler = setTimeout(() => {
        setDebouncedValue(value);
      }, maxWait);

      return () => {
        clearTimeout(maxWaitHandler);
      };
    }
  }, [value, maxWait]);

  return debouncedValue;
}

/**
 * Debounce hook specifically for functions
 * Returns a debounced version of the provided function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[] = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedFn = ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T;

    setDebouncedCallback(() => debouncedFn);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [callback, delay, ...dependencies]);

  return debouncedCallback;
}

/**
 * Hook for debouncing API calls with loading state
 */
export function useDebouncedAPICall<T>(
  apiCall: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    apiCall(debouncedQuery)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        setData(null);
      });
  }, [debouncedQuery, apiCall]);

  return {
    query,
    setQuery,
    data,
    loading,
    error,
    debouncedQuery
  };
}
