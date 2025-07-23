/**
 * Performance Monitoring System
 * Tracks Core Web Vitals and application performance metrics
 */

export interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface CustomMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  componentRenderTime: number;
  errorCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private customMetrics: CustomMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    componentRenderTime: 0,
    errorCount: 0
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.setupNavigationTimingAPI();
    }
  }

  private initializeWebVitals() {
    // Measure Core Web Vitals
    this.measureFCP();
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureTTFB();
  }

  private measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.FCP = fcpEntry.startTime;
          this.reportMetric('FCP', fcpEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.LCP = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          // Only report if the page wasn't hidden prior to the first input
          if (entry.name === 'first-input' && !document.hidden) {
            this.metrics.FID = (entry as any).processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.FID);
          }
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.CLS = clsValue;
        this.reportMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private measureTTFB() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        this.metrics.TTFB = navEntry.responseStart - navEntry.fetchStart;
        this.reportMetric('TTFB', this.metrics.TTFB);
      }
    }
  }

  private setupNavigationTimingAPI() {
    if ('performance' in window && 'addEventListener' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            this.customMetrics.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            this.reportMetric('PageLoad', this.customMetrics.pageLoadTime);
          }
        }, 0);
      });
    }
  }

  // Track API response times
  trackAPICall(endpoint: string, startTime: number, endTime: number) {
    const responseTime = endTime - startTime;
    this.customMetrics.apiResponseTime = responseTime;
    this.reportMetric('APIResponse', responseTime, { endpoint });
  }

  // Track component render times
  trackComponentRender(componentName: string, renderTime: number) {
    this.customMetrics.componentRenderTime = renderTime;
    this.reportMetric('ComponentRender', renderTime, { component: componentName });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.customMetrics.errorCount++;
    this.reportMetric('Error', 1, { 
      message: error.message, 
      stack: error.stack,
      context 
    });
  }

  private reportMetric(name: string, value: number, additionalData?: any) {
    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}ms`, additionalData);
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        ...additionalData
      });
    }

    // Send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        category: 'performance',
        message: `${name}: ${value}ms`,
        level: 'info',
        data: additionalData
      });
    }
  }

  // Get current metrics snapshot
  getMetrics(): { coreWebVitals: PerformanceMetrics; custom: CustomMetrics } {
    return {
      coreWebVitals: { ...this.metrics },
      custom: { ...this.customMetrics }
    };
  }

  // Check if metrics meet performance targets
  checkPerformanceTargets(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const targets = {
      LCP: 2500, // 2.5 seconds
      FID: 100,  // 100 milliseconds
      CLS: 0.1,  // 0.1
      TTFB: 600  // 600 milliseconds
    };

    if (this.metrics.LCP && this.metrics.LCP > targets.LCP) {
      issues.push(`LCP (${Math.round(this.metrics.LCP)}ms) exceeds target (${targets.LCP}ms)`);
    }

    if (this.metrics.FID && this.metrics.FID > targets.FID) {
      issues.push(`FID (${Math.round(this.metrics.FID)}ms) exceeds target (${targets.FID}ms)`);
    }

    if (this.metrics.CLS && this.metrics.CLS > targets.CLS) {
      issues.push(`CLS (${this.metrics.CLS.toFixed(3)}) exceeds target (${targets.CLS})`);
    }

    if (this.metrics.TTFB && this.metrics.TTFB > targets.TTFB) {
      issues.push(`TTFB (${Math.round(this.metrics.TTFB)}ms) exceeds target (${targets.TTFB}ms)`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();
  
  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    },
    trackError: (error: Error) => {
      performanceMonitor.trackError(error, componentName);
    }
  };
}

// API call wrapper with performance tracking
export async function trackAPICall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const endTime = performance.now();
    performanceMonitor.trackAPICall(endpoint, startTime, endTime);
    return result;
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.trackAPICall(endpoint, startTime, endTime);
    performanceMonitor.trackError(error as Error, endpoint);
    throw error;
  }
}