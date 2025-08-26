export type NormalizedError = { message: string; code?: string | number };

export interface AppError extends NormalizedError {
  category?: string;
  retryable?: boolean;
}

export interface ErrorAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof Error) return { message: err.message };
  if (typeof err === 'string') return { message: err };
  try {
    return { message: JSON.stringify(err) };
  } catch {
    return { message: 'Unknown error' };
  }
}

export function reportError(_err: unknown): void {
  // no-op stub; hook logging here later
}

export const ErrorHandler = {
  handleError(err: unknown): AppError {
    const normalized = normalizeError(err);
    return { ...normalized, category: 'general', retryable: false };
  },
  getErrorActions(_err: AppError): ErrorAction[] {
    return [];
  },
};

