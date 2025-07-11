import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatCurrencyWhole,
  parseCurrency,
  formatPercentage,
  formatNumber,
  formatFileSize,
  formatDuration,
  formatRelativeTime
} from '../formatCurrency';

describe('formatCurrency', () => {
  it('should format currency with default USD', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000.50)).toBe('$1,000.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format currency with different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00');
  });

  it('should format currency with different locales', () => {
    expect(formatCurrency(1000, 'USD', 'en-US')).toBe('$1,000.00');
    // Note: Different locales may have different formatting
    expect(formatCurrency(1000, 'EUR', 'de-DE')).toContain('1.000');
    expect(formatCurrency(1000, 'EUR', 'de-DE')).toContain('€');
  });
});

describe('formatCurrencyCompact', () => {
  it('should format large numbers with compact notation', () => {
    expect(formatCurrencyCompact(1000)).toBe('$1.0K');
    expect(formatCurrencyCompact(1500)).toBe('$1.5K');
    expect(formatCurrencyCompact(1000000)).toBe('$1.0M');
    expect(formatCurrencyCompact(1500000)).toBe('$1.5M');
  });

  it('should format small numbers normally', () => {
    expect(formatCurrencyCompact(100)).toBe('$100.0');
    expect(formatCurrencyCompact(500)).toBe('$500.0');
  });
});

describe('formatCurrencyWhole', () => {
  it('should format currency without decimal places', () => {
    expect(formatCurrencyWhole(1000)).toBe('$1,000');
    expect(formatCurrencyWhole(1000.50)).toBe('$1,001');
    expect(formatCurrencyWhole(1000.25)).toBe('$1,000');
  });
});

describe('parseCurrency', () => {
  it('should parse currency strings to numbers', () => {
    expect(parseCurrency('$1,000.00')).toBe(1000);
    expect(parseCurrency('€1,000.50')).toBe(1000.50);
    expect(parseCurrency('£1,234.56')).toBe(1234.56);
    expect(parseCurrency('$0.00')).toBe(0);
  });

  it('should handle negative values', () => {
    expect(parseCurrency('-$1,000.00')).toBe(-1000);
    expect(parseCurrency('($1,000.00)')).toBe(1000);
  });

  it('should handle plain numbers', () => {
    expect(parseCurrency('1000')).toBe(1000);
    expect(parseCurrency('1000.50')).toBe(1000.50);
  });
});

describe('formatPercentage', () => {
  it('should format percentages with default decimals', () => {
    expect(formatPercentage(50)).toBe('50.0%');
    expect(formatPercentage(75.5)).toBe('75.5%');
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should format percentages with custom decimals', () => {
    expect(formatPercentage(50, 0)).toBe('50%');
    expect(formatPercentage(75.555, 2)).toBe('75.56%');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatFileSize', () => {
  it('should format file sizes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should handle decimal places', () => {
    expect(formatFileSize(1536, 1)).toBe('1.5 KB');
    expect(formatFileSize(1536, 0)).toBe('2 KB');
  });
});

describe('formatDuration', () => {
  it('should format durations correctly', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3600)).toBe('1h 0m 0s');
    expect(formatDuration(3690)).toBe('1h 1m 30s');
  });

  it('should handle zero duration', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date();
  
  it('should format relative times correctly', () => {
    const justNow = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(justNow)).toBe('just now');
    
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
  });

  it('should handle different input formats', () => {
    const timestamp = now.getTime() - 60 * 1000;
    expect(formatRelativeTime(timestamp)).toBe('1 minute ago');
    
    const isoString = new Date(now.getTime() - 60 * 1000).toISOString();
    expect(formatRelativeTime(isoString)).toBe('1 minute ago');
  });
});