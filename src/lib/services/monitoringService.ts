/**
 * Advanced Monitoring Service for AuditoryX Platform
 * Implements comprehensive monitoring, error tracking, and performance analytics
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userId?: string;
  timestamp: Date;
  userAgent: string;
  sessionId: string;
  additionalData?: any;
}

interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface UserInteraction {
  event: string;
  element: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata?: any;
}

interface APIPerformance {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  errorMessage?: string;
}

export class MonitoringService {
  private sessionId: string;
  private userId?: string;
  private performanceObserver?: PerformanceObserver;
  private errorQueue: ErrorReport[] = [];
  private metricsQueue: CustomMetric[] = [];
  private interactionQueue: UserInteraction[] = [];
  private apiQueue: APIPerformance[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * Initialize monitoring service
   */
  private init(): void {
    this.setupErrorTracking();
    this.setupPerformanceMonitoring();
    this.setupUserInteractionTracking();
    this.setupAPIMonitoring();
    this.startPeriodicFlush();
  }

  /**
   * Set current user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Setup global error tracking
   */
  private setupErrorTracking(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        userId: this.userId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userId: this.userId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        additionalData: { type: 'unhandledRejection' }
      });
    });

    // Handle React error boundaries (if using custom error boundary)
    window.addEventListener('react-error', (event: any) => {
      this.reportError({
        message: event.detail.error.message,
        stack: event.detail.error.stack,
        url: window.location.href,
        userId: this.userId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        additionalData: { 
          type: 'react-error',
          componentStack: event.detail.errorInfo?.componentStack
        }
      });
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Monitor FCP, LCP, FID, CLS
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceMetric(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'layout-shift', 'first-input'] });
      this.performanceObserver = observer;
    }

    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = this.getPageLoadMetrics();
        this.recordCustomMetric('page_load_complete', metrics.pageLoadTime, 'ms');
        this.recordCustomMetric('first_contentful_paint', metrics.firstContentfulPaint, 'ms');
      }, 0);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordCustomMetric('long_task', entry.duration, 'ms', {
            name: entry.name,
            startTime: entry.startTime.toString()
          });
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  /**
   * Setup user interaction tracking
   */
  private setupUserInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      this.recordUserInteraction('click', this.getElementSelector(element), {
        x: event.clientX,
        y: event.clientY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey
      });
    });

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.recordUserInteraction('form_submit', this.getElementSelector(form), {
        action: form.action,
        method: form.method
      });
    });

    // Input focus tracking (for UX analysis)
    document.addEventListener('focusin', (event) => {
      const element = event.target as HTMLElement;
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        this.recordUserInteraction('input_focus', this.getElementSelector(element), {
          type: (element as HTMLInputElement).type
        });
      }
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordUserInteraction('visibility_change', 'document', {
        hidden: document.hidden
      });
    });
  }

  /**
   * Setup API monitoring
   */
  private setupAPIMonitoring(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        
        this.recordAPIPerformance({
          endpoint: url,
          method,
          responseTime: endTime - startTime,
          statusCode: response.status,
          timestamp: new Date(),
          userId: this.userId
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordAPIPerformance({
          endpoint: url,
          method,
          responseTime: endTime - startTime,
          statusCode: 0,
          timestamp: new Date(),
          userId: this.userId,
          errorMessage: error instanceof Error ? error.message : String(error)
        });

        throw error;
      }
    };
  }

  /**
   * Report an error
   */
  reportError(error: ErrorReport): void {
    this.errorQueue.push(error);
    
    // Immediately send critical errors
    if (this.isCriticalError(error)) {
      this.flushErrors();
    }
  }

  /**
   * Record a custom metric
   */
  recordCustomMetric(
    name: string, 
    value: number, 
    unit: string = 'count',
    tags?: Record<string, string>
  ): void {
    this.metricsQueue.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    });
  }

  /**
   * Record user interaction
   */
  recordUserInteraction(event: string, element: string, metadata?: any): void {
    this.interactionQueue.push({
      event,
      element,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata
    });
  }

  /**
   * Record API performance
   */
  recordAPIPerformance(performance: APIPerformance): void {
    this.apiQueue.push(performance);
  }

  /**
   * Get page load metrics
   */
  private getPageLoadMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    
    return {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: fcp?.startTime || 0,
      largestContentfulPaint: 0, // Will be updated by PerformanceObserver
      firstInputDelay: 0, // Will be updated by PerformanceObserver
      cumulativeLayoutShift: 0, // Will be updated by PerformanceObserver
      timeToInteractive: navigation.domInteractive - navigation.navigationStart
    };
  }

  /**
   * Record performance metric from PerformanceObserver
   */
  private recordPerformanceMetric(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        this.recordCustomMetric(`paint_${entry.name.replace(/-/g, '_')}`, entry.startTime, 'ms');
        break;
      
      case 'largest-contentful-paint':
        this.recordCustomMetric('largest_contentful_paint', entry.startTime, 'ms');
        break;
      
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.recordCustomMetric('first_input_delay', fidEntry.processingStart - fidEntry.startTime, 'ms');
        break;
      
      case 'layout-shift':
        const clsEntry = entry as any; // LayoutShift interface
        if (!clsEntry.hadRecentInput) {
          this.recordCustomMetric('cumulative_layout_shift', clsEntry.value, 'score');
        }
        break;
      
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordCustomMetric('dns_lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'ms');
        this.recordCustomMetric('tcp_connect', navEntry.connectEnd - navEntry.connectStart, 'ms');
        this.recordCustomMetric('request_response', navEntry.responseEnd - navEntry.requestStart, 'ms');
        this.recordCustomMetric('dom_processing', navEntry.domComplete - navEntry.domLoading, 'ms');
        break;
    }
  }

  /**
   * Get element selector for tracking
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(error: ErrorReport): boolean {
    const criticalPatterns = [
      /payment/i,
      /booking/i,
      /authentication/i,
      /security/i,
      /database/i
    ];

    return criticalPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Start periodic data flush
   */
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushAllData();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush all queued data
   */
  private async flushAllData(): Promise<void> {
    await Promise.all([
      this.flushErrors(),
      this.flushMetrics(),
      this.flushInteractions(),
      this.flushAPIPerformance()
    ]);
  }

  /**
   * Flush error queue
   */
  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      });
    } catch (error) {
      console.error('Failed to send error reports:', error);
      // Re-queue errors for retry
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Flush metrics queue
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      this.metricsQueue.unshift(...metrics);
    }
  }

  /**
   * Flush interactions queue
   */
  private async flushInteractions(): Promise<void> {
    if (this.interactionQueue.length === 0) return;

    const interactions = [...this.interactionQueue];
    this.interactionQueue = [];

    try {
      await fetch('/api/monitoring/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactions })
      });
    } catch (error) {
      console.error('Failed to send interactions:', error);
      this.interactionQueue.unshift(...interactions);
    }
  }

  /**
   * Flush API performance queue
   */
  private async flushAPIPerformance(): Promise<void> {
    if (this.apiQueue.length === 0) return;

    const apiMetrics = [...this.apiQueue];
    this.apiQueue = [];

    try {
      await fetch('/api/monitoring/api-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiMetrics })
      });
    } catch (error) {
      console.error('Failed to send API performance metrics:', error);
      this.apiQueue.unshift(...apiMetrics);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Manually trigger data flush
   */
  async flush(): Promise<void> {
    await this.flushAllData();
  }

  /**
   * Cleanup monitoring service
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Final flush
    this.flush();
  }

  /**
   * Get current session metrics
   */
  getSessionMetrics(): {
    sessionId: string;
    userId?: string;
    startTime: Date;
    errorsCount: number;
    metricsCount: number;
    interactionsCount: number;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date(), // Would be tracked from init
      errorsCount: this.errorQueue.length,
      metricsCount: this.metricsQueue.length,
      interactionsCount: this.interactionQueue.length
    };
  }

  /**
   * Add custom data to next error report
   */
  addErrorContext(key: string, value: any): void {
    // Store context for next error
    if (!window.__errorContext) {
      window.__errorContext = {};
    }
    window.__errorContext[key] = value;
  }

  /**
   * Track custom business event
   */
  trackBusinessEvent(event: string, properties?: Record<string, any>): void {
    this.recordUserInteraction('business_event', event, {
      type: 'business',
      properties
    });
  }

  /**
   * Track performance benchmark
   */
  trackPerformanceBenchmark(name: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.recordCustomMetric(`benchmark_${name}`, duration, 'ms');
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  monitoringService.cleanup();
});

// Export for manual initialization if needed
export default MonitoringService;
