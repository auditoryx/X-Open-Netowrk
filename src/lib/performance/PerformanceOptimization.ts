/**
 * Phase 2B: Enhanced Performance Optimization Service
 * 
 * Extends the existing performance monitor with bundle optimization,
 * lazy loading metrics, and Lighthouse score tracking
 */

import { PerformanceMonitor } from '@/lib/monitoring/performanceMonitor';

interface BundleMetrics {
  totalSize: number;
  mainBundleSize: number;
  vendorBundleSize: number;
  chunkSizes: Record<string, number>;
  loadTimes: Record<string, number>;
}

interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceOptimizationService {
  private performanceMonitor: PerformanceMonitor;
  private bundleMetrics: BundleMetrics | null = null;
  private lighthouseMetrics: LighthouseMetrics | null = null;
  private lazyLoadTimes: Map<string, number> = new Map();

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.initializeBundleTracking();
    this.initializeLazyLoadTracking();
  }

  // Phase 2B: Bundle size tracking
  private initializeBundleTracking() {
    if (typeof window === 'undefined') return;

    // Track initial bundle sizes
    this.trackBundleMetrics();
    
    // Monitor dynamic imports
    const originalImport = window.import || (() => {});
    // @ts-ignore
    window.import = async (specifier: string) => {
      const startTime = performance.now();
      try {
        const module = await originalImport(specifier);
        const loadTime = performance.now() - startTime;
        this.trackDynamicImport(specifier, loadTime);
        return module;
      } catch (error) {
        this.performanceMonitor.trackError('dynamic-import-failed', error as Error, {
          specifier,
          loadTime: performance.now() - startTime
        });
        throw error;
      }
    };
  }

  // Track bundle metrics from webpack stats
  private trackBundleMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    // Get resource timing data for scripts
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources.filter(r => r.name.includes('_next/static') && r.name.endsWith('.js'));
    
    let totalSize = 0;
    let mainBundleSize = 0;
    let vendorBundleSize = 0;
    const chunkSizes: Record<string, number> = {};
    const loadTimes: Record<string, number> = {};

    scripts.forEach(script => {
      const size = script.transferSize || 0;
      const loadTime = script.responseEnd - script.requestStart;
      
      totalSize += size;
      loadTimes[script.name] = loadTime;
      
      if (script.name.includes('main')) {
        mainBundleSize += size;
      } else if (script.name.includes('vendor') || script.name.includes('chunk')) {
        vendorBundleSize += size;
      }
      
      chunkSizes[script.name] = size;
    });

    this.bundleMetrics = {
      totalSize,
      mainBundleSize,
      vendorBundleSize,
      chunkSizes,
      loadTimes
    };

    // Track bundle performance
    this.performanceMonitor.trackMetric('bundleSize', totalSize, {
      main: mainBundleSize,
      vendor: vendorBundleSize,
      target: 500 * 1024, // 500KB target
      exceedsTarget: totalSize > 500 * 1024
    });
  }

  // Phase 2B: Lazy loading performance tracking
  private initializeLazyLoadTracking() {
    if (typeof window === 'undefined') return;

    // Track lazy component load times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          this.analyzeLazyLoadPerformance(entry as PerformanceResourceTiming);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });
  }

  private analyzeLazyLoadPerformance(entry: PerformanceResourceTiming) {
    if (entry.name.includes('lazy') || entry.name.includes('chunk')) {
      const loadTime = entry.responseEnd - entry.requestStart;
      this.lazyLoadTimes.set(entry.name, loadTime);
      
      this.performanceMonitor.trackMetric('lazyLoadTime', loadTime, {
        chunk: entry.name,
        size: entry.transferSize,
        cached: entry.transferSize === 0
      });
    }
  }

  // Track dynamic import performance
  trackDynamicImport(specifier: string, loadTime: number) {
    this.performanceMonitor.trackMetric('dynamicImportTime', loadTime, {
      specifier,
      fast: loadTime < 100,
      slow: loadTime > 1000
    });
  }

  // Phase 2B: Lighthouse metrics tracking
  trackLighthouseMetrics(metrics: Partial<LighthouseMetrics>) {
    this.lighthouseMetrics = { ...this.lighthouseMetrics, ...metrics } as LighthouseMetrics;
    
    // Track individual metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        this.performanceMonitor.trackMetric(`lighthouse_${key}`, value, {
          target: this.getLighthouseTarget(key),
          passing: this.isLighthousePassing(key, value)
        });
      }
    });

    // Calculate overall Lighthouse score
    if (this.lighthouseMetrics) {
      const overallScore = this.calculateOverallLighthouseScore();
      this.performanceMonitor.trackMetric('lighthouse_overall', overallScore, {
        target: 90,
        passing: overallScore >= 90
      });
    }
  }

  private getLighthouseTarget(metric: string): number {
    const targets: Record<string, number> = {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 85,
      pwa: 80,
      fcp: 1800, // ms
      lcp: 2500, // ms
      fid: 100,  // ms
      cls: 0.1,  // score
      ttfb: 600  // ms
    };
    return targets[metric] || 0;
  }

  private isLighthousePassing(metric: string, value: number): boolean {
    const target = this.getLighthouseTarget(metric);
    
    // For time-based metrics, lower is better
    if (['fcp', 'lcp', 'fid', 'ttfb'].includes(metric)) {
      return value <= target;
    }
    
    // For CLS, lower is better
    if (metric === 'cls') {
      return value <= target;
    }
    
    // For score-based metrics, higher is better
    return value >= target;
  }

  private calculateOverallLighthouseScore(): number {
    if (!this.lighthouseMetrics) return 0;
    
    const { performance, accessibility, bestPractices, seo } = this.lighthouseMetrics;
    return Math.round((performance + accessibility + bestPractices + seo) / 4);
  }

  // Phase 2B: Core Web Vitals optimization analysis
  analyzeWebVitals() {
    if (!this.lighthouseMetrics) return null;

    const { lcp, fid, cls, fcp, ttfb } = this.lighthouseMetrics;
    
    const analysis = {
      lcp: {
        value: lcp,
        status: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
        recommendations: this.getLCPRecommendations(lcp)
      },
      fid: {
        value: fid,
        status: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
        recommendations: this.getFIDRecommendations(fid)
      },
      cls: {
        value: cls,
        status: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor',
        recommendations: this.getCLSRecommendations(cls)
      },
      fcp: {
        value: fcp,
        status: fcp <= 1800 ? 'good' : fcp <= 3000 ? 'needs-improvement' : 'poor',
        recommendations: this.getFCPRecommendations(fcp)
      },
      ttfb: {
        value: ttfb,
        status: ttfb <= 600 ? 'good' : ttfb <= 1500 ? 'needs-improvement' : 'poor',
        recommendations: this.getTTFBRecommendations(ttfb)
      }
    };

    return analysis;
  }

  private getLCPRecommendations(lcp: number): string[] {
    const recommendations = [];
    if (lcp > 2500) {
      recommendations.push('Optimize largest image or text block loading');
      recommendations.push('Implement lazy loading for below-the-fold content');
      recommendations.push('Preload critical resources');
    }
    if (lcp > 4000) {
      recommendations.push('Enable compression (gzip/brotli)');
      recommendations.push('Use a CDN for static assets');
      recommendations.push('Optimize server response times');
    }
    return recommendations;
  }

  private getFIDRecommendations(fid: number): string[] {
    const recommendations = [];
    if (fid > 100) {
      recommendations.push('Reduce JavaScript execution time');
      recommendations.push('Split large bundles with code splitting');
      recommendations.push('Remove unused JavaScript');
    }
    if (fid > 300) {
      recommendations.push('Use web workers for heavy computations');
      recommendations.push('Implement lazy loading for non-critical features');
      recommendations.push('Minimize main thread blocking');
    }
    return recommendations;
  }

  private getCLSRecommendations(cls: number): string[] {
    const recommendations = [];
    if (cls > 0.1) {
      recommendations.push('Set explicit dimensions for images and embeds');
      recommendations.push('Reserve space for dynamic content');
      recommendations.push('Avoid inserting content above existing content');
    }
    if (cls > 0.25) {
      recommendations.push('Preload fonts to prevent font swap');
      recommendations.push('Use transform instead of changing layout properties');
      recommendations.push('Set aspect-ratio CSS property for responsive images');
    }
    return recommendations;
  }

  private getFCPRecommendations(fcp: number): string[] {
    const recommendations = [];
    if (fcp > 1800) {
      recommendations.push('Optimize CSS delivery');
      recommendations.push('Remove render-blocking resources');
      recommendations.push('Inline critical CSS');
    }
    if (fcp > 3000) {
      recommendations.push('Minimize server response time');
      recommendations.push('Use efficient image formats (WebP, AVIF)');
      recommendations.push('Enable text compression');
    }
    return recommendations;
  }

  private getTTFBRecommendations(ttfb: number): string[] {
    const recommendations = [];
    if (ttfb > 600) {
      recommendations.push('Optimize server processing time');
      recommendations.push('Use server-side caching');
      recommendations.push('Minimize redirects');
    }
    if (ttfb > 1500) {
      recommendations.push('Use a CDN');
      recommendations.push('Optimize database queries');
      recommendations.push('Consider edge computing solutions');
    }
    return recommendations;
  }

  // Generate performance optimization report
  generateOptimizationReport() {
    const webVitals = this.analyzeWebVitals();
    const bundleAnalysis = this.bundleMetrics;
    
    return {
      timestamp: new Date().toISOString(),
      bundleOptimization: {
        totalSize: bundleAnalysis?.totalSize || 0,
        target: 500 * 1024,
        sizeOptimal: (bundleAnalysis?.totalSize || 0) < 500 * 1024,
        recommendations: this.getBundleRecommendations()
      },
      webVitals,
      lighthouseScores: this.lighthouseMetrics,
      lazyLoadPerformance: Array.from(this.lazyLoadTimes.entries()).map(([chunk, time]) => ({
        chunk,
        loadTime: time,
        optimal: time < 500
      })),
      overallReadiness: this.calculateOverallReadiness()
    };
  }

  private getBundleRecommendations(): string[] {
    const recommendations = [];
    const totalSize = this.bundleMetrics?.totalSize || 0;
    
    if (totalSize > 500 * 1024) {
      recommendations.push('Enable code splitting for route-based chunks');
      recommendations.push('Implement dynamic imports for heavy features');
      recommendations.push('Remove unused dependencies');
    }
    
    if (totalSize > 800 * 1024) {
      recommendations.push('Use tree shaking to eliminate dead code');
      recommendations.push('Split vendor bundles from application code');
      recommendations.push('Consider lazy loading non-critical components');
    }
    
    return recommendations;
  }

  private calculateOverallReadiness(): number {
    let score = 0;
    let factors = 0;

    // Bundle size factor (25%)
    if (this.bundleMetrics) {
      const bundleScore = (this.bundleMetrics.totalSize < 500 * 1024) ? 100 : 
        Math.max(0, 100 - ((this.bundleMetrics.totalSize - 500 * 1024) / (300 * 1024)) * 50);
      score += bundleScore * 0.25;
      factors += 0.25;
    }

    // Lighthouse score factor (50%)
    if (this.lighthouseMetrics) {
      const lighthouseScore = this.calculateOverallLighthouseScore();
      score += lighthouseScore * 0.5;
      factors += 0.5;
    }

    // Web Vitals factor (25%)
    const webVitals = this.analyzeWebVitals();
    if (webVitals) {
      const vitalsScore = Object.values(webVitals).reduce((acc, vital) => {
        return acc + (vital.status === 'good' ? 100 : vital.status === 'needs-improvement' ? 50 : 0);
      }, 0) / Object.keys(webVitals).length;
      score += vitalsScore * 0.25;
      factors += 0.25;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  // Public API methods
  getBundleMetrics() {
    return this.bundleMetrics;
  }

  getLighthouseMetrics() {
    return this.lighthouseMetrics;
  }

  getLazyLoadTimes() {
    return Array.from(this.lazyLoadTimes.entries());
  }

  // Integration with existing performance monitor
  getPerformanceMonitor() {
    return this.performanceMonitor;
  }
}

// Export singleton instance
export const performanceOptimization = new PerformanceOptimizationService();
export default performanceOptimization;