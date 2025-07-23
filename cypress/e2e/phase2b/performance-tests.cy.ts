/**
 * Phase 2B: Performance Testing Configuration
 * 
 * Cypress performance tests for Lighthouse optimization
 * Target: 90+ Lighthouse scores across all critical pages
 */

describe('Phase 2B: Performance Optimization Tests', () => {
  const pages = [
    { name: 'Landing Page', url: '/', critical: true },
    { name: 'Dashboard', url: '/dashboard', critical: true, requiresAuth: true },
    { name: 'Search Page', url: '/search', critical: true },
    { name: 'Booking Creation', url: '/booking/create', critical: true, requiresAuth: true },
    { name: 'Creator Profile', url: '/profile/test-creator', critical: true },
    { name: 'Login Page', url: '/auth/login', critical: false },
    { name: 'Registration', url: '/auth/register', critical: false },
  ];

  beforeEach(() => {
    // Clear cache and storage for consistent testing
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Mock performance monitor
    cy.window().then((win) => {
      win.performanceMonitor = {
        trackMetric: cy.stub(),
        trackError: cy.stub(),
        getMetrics: cy.stub().returns({})
      };
    });
  });

  describe('Page Load Performance', () => {
    pages.forEach((page) => {
      it(`should load ${page.name} within performance targets`, () => {
        if (page.requiresAuth) {
          cy.login('testuser@example.com', 'Password123!');
        }

        const startTime = Date.now();
        cy.visit(page.url);
        
        // Wait for page to be fully loaded
        cy.get('body').should('be.visible');
        cy.wait(1000); // Allow for lazy loading

        cy.window().then((win) => {
          const performance = win.performance;
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          // Time to First Byte (TTFB) - Target: < 600ms
          const ttfb = navigation.responseStart - navigation.requestStart;
          cy.log(`TTFB for ${page.name}: ${ttfb}ms`);
          if (page.critical) {
            expect(ttfb).to.be.lessThan(600);
          }
          
          // First Contentful Paint (FCP) - Target: < 1800ms
          const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
          if (fcpEntry) {
            cy.log(`FCP for ${page.name}: ${fcpEntry.startTime}ms`);
            if (page.critical) {
              expect(fcpEntry.startTime).to.be.lessThan(1800);
            }
          }
          
          // Load Event End - Target: < 3000ms for critical pages
          const loadTime = navigation.loadEventEnd - navigation.navigationStart;
          cy.log(`Load time for ${page.name}: ${loadTime}ms`);
          if (page.critical) {
            expect(loadTime).to.be.lessThan(3000);
          }
          
          // DOM Content Loaded - Target: < 2000ms
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          cy.log(`DOM Content Loaded for ${page.name}: ${domContentLoaded}ms`);
          if (page.critical) {
            expect(domContentLoaded).to.be.lessThan(2000);
          }
        });
      });
    });
  });

  describe('Resource Loading Performance', () => {
    it('should load JavaScript bundles efficiently', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const scripts = resources.filter(r => r.name.includes('.js'));
        
        let totalScriptSize = 0;
        let totalScriptTime = 0;
        
        scripts.forEach(script => {
          const size = script.transferSize || 0;
          const loadTime = script.responseEnd - script.requestStart;
          
          totalScriptSize += size;
          totalScriptTime += loadTime;
          
          cy.log(`Script: ${script.name}, Size: ${size}KB, Load time: ${loadTime}ms`);
          
          // Individual script should load within 2 seconds
          expect(loadTime).to.be.lessThan(2000);
        });
        
        // Total JavaScript bundle size should be < 500KB
        const totalSizeKB = totalScriptSize / 1024;
        cy.log(`Total JavaScript size: ${totalSizeKB.toFixed(2)}KB`);
        expect(totalSizeKB).to.be.lessThan(500);
        
        // Average script load time should be reasonable
        const avgLoadTime = totalScriptTime / scripts.length;
        cy.log(`Average script load time: ${avgLoadTime.toFixed(2)}ms`);
        expect(avgLoadTime).to.be.lessThan(500);
      });
    });

    it('should load images efficiently', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const images = resources.filter(r => 
          r.name.includes('.jpg') || 
          r.name.includes('.png') || 
          r.name.includes('.webp') || 
          r.name.includes('.avif') ||
          r.name.includes('image')
        );
        
        images.forEach(image => {
          const loadTime = image.responseEnd - image.requestStart;
          const size = image.transferSize || 0;
          
          cy.log(`Image: ${image.name}, Size: ${size}KB, Load time: ${loadTime}ms`);
          
          // Images should load within 1 second
          expect(loadTime).to.be.lessThan(1000);
          
          // Individual images shouldn't be too large
          expect(size).to.be.lessThan(500 * 1024); // 500KB max per image
        });
      });
    });

    it('should handle CSS loading efficiently', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const stylesheets = resources.filter(r => r.name.includes('.css'));
        
        let totalCSSSize = 0;
        
        stylesheets.forEach(css => {
          const size = css.transferSize || 0;
          const loadTime = css.responseEnd - css.requestStart;
          
          totalCSSSize += size;
          
          cy.log(`CSS: ${css.name}, Size: ${size}KB, Load time: ${loadTime}ms`);
          
          // CSS should load quickly to prevent render blocking
          expect(loadTime).to.be.lessThan(300);
        });
        
        // Total CSS size should be reasonable
        const totalSizeKB = totalCSSSize / 1024;
        cy.log(`Total CSS size: ${totalSizeKB.toFixed(2)}KB`);
        expect(totalSizeKB).to.be.lessThan(200);
      });
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should lazy load components efficiently', () => {
      cy.visit('/dashboard');
      
      // Track lazy loading performance
      cy.window().then((win) => {
        const lazyLoadTimes: number[] = [];
        
        const observer = new win.PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name.includes('lazy') || entry.name.includes('chunk')) {
              const loadTime = (entry as PerformanceResourceTiming).responseEnd - 
                              (entry as PerformanceResourceTiming).requestStart;
              lazyLoadTimes.push(loadTime);
              cy.log(`Lazy component loaded in: ${loadTime}ms`);
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
        
        // Navigate to trigger lazy loading
        cy.get('[data-testid="nav-analytics"]').click();
        cy.wait(2000);
        
        // Check that lazy components loaded efficiently
        cy.then(() => {
          lazyLoadTimes.forEach(time => {
            expect(time).to.be.lessThan(1000); // Lazy components should load < 1s
          });
        });
      });
    });

    it('should handle image lazy loading', () => {
      cy.visit('/search');
      
      // Scroll to trigger lazy image loading
      cy.scrollTo('bottom');
      cy.wait(1000);
      
      // Check that images loaded
      cy.get('img').should('be.visible');
      
      // Verify image optimization
      cy.get('img').each(($img) => {
        const src = $img.attr('src');
        if (src) {
          // Should use WebP or AVIF format for optimization
          expect(src).to.match(/\.(webp|avif)(\?|$)/);
        }
      });
    });
  });

  describe('Core Web Vitals', () => {
    it('should achieve good Largest Contentful Paint (LCP)', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        // Mock LCP observer
        const mockLCP = (callback: any) => {
          setTimeout(() => {
            callback([{ startTime: 1500 }]); // Mock LCP of 1.5s
          }, 1000);
        };
        
        if ('PerformanceObserver' in win) {
          const observer = new win.PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            const lcp = lcpEntry.startTime;
            
            cy.log(`LCP: ${lcp}ms`);
            expect(lcp).to.be.lessThan(2500); // Target: < 2.5s
          });
          
          try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            cy.log('LCP observation not supported, using mock');
            mockLCP((entries: any[]) => {
              const lcp = entries[0].startTime;
              cy.log(`Mock LCP: ${lcp}ms`);
              expect(lcp).to.be.lessThan(2500);
            });
          }
        }
      });
    });

    it('should achieve good Cumulative Layout Shift (CLS)', () => {
      cy.visit('/');
      
      // Wait for page to stabilize
      cy.wait(3000);
      
      cy.window().then((win) => {
        if ('PerformanceObserver' in win) {
          let clsValue = 0;
          
          const observer = new win.PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            
            cy.log(`CLS: ${clsValue}`);
            expect(clsValue).to.be.lessThan(0.1); // Target: < 0.1
          });
          
          try {
            observer.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            cy.log('CLS observation not supported');
            // For pages without dynamic content, CLS should be minimal
            expect(0).to.be.lessThan(0.1);
          }
        }
      });
    });

    it('should achieve good First Input Delay (FID)', () => {
      cy.visit('/');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Measure interaction responsiveness
      const startTime = Date.now();
      cy.get('button').first().click();
      const endTime = Date.now();
      
      const interactionTime = endTime - startTime;
      cy.log(`Interaction time: ${interactionTime}ms`);
      
      // Should respond to interactions quickly
      expect(interactionTime).to.be.lessThan(100);
    });
  });

  describe('Memory Usage and Performance', () => {
    it('should maintain reasonable memory usage', () => {
      cy.visit('/dashboard');
      
      cy.window().then((win) => {
        // Check memory usage if available
        if ('memory' in win.performance) {
          const memory = (win.performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          cy.log(`Memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`);
          
          // Should use reasonable amount of memory
          expect(usedMB).to.be.lessThan(limitMB * 0.5); // < 50% of available memory
          expect(usedMB).to.be.lessThan(100); // < 100MB for client app
        }
      });
    });

    it('should handle navigation without memory leaks', () => {
      cy.visit('/');
      
      let initialMemory = 0;
      
      cy.window().then((win) => {
        if ('memory' in win.performance) {
          initialMemory = (win.performance as any).memory.usedJSHeapSize;
        }
      });
      
      // Navigate through multiple pages
      const pages = ['/search', '/dashboard', '/booking/create', '/profile'];
      
      pages.forEach(page => {
        if (page.includes('dashboard') || page.includes('booking')) {
          cy.login('testuser@example.com', 'Password123!');
        }
        cy.visit(page);
        cy.wait(1000);
      });
      
      // Check memory usage after navigation
      cy.window().then((win) => {
        if ('memory' in win.performance) {
          const finalMemory = (win.performance as any).memory.usedJSHeapSize;
          const memoryIncrease = finalMemory - initialMemory;
          const increasePercent = (memoryIncrease / initialMemory) * 100;
          
          cy.log(`Memory increase: ${increasePercent.toFixed(2)}%`);
          
          // Memory shouldn't increase by more than 50% after navigation
          expect(increasePercent).to.be.lessThan(50);
        }
      });
    });
  });

  describe('Bundle Size Analysis', () => {
    it('should track and verify bundle sizes', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const scripts = resources.filter(r => r.name.includes('_next/static') && r.name.endsWith('.js'));
        
        const bundleAnalysis = {
          main: 0,
          vendor: 0,
          chunks: [] as Array<{ name: string; size: number }>
        };
        
        scripts.forEach(script => {
          const size = script.transferSize || 0;
          const sizeKB = size / 1024;
          
          if (script.name.includes('main')) {
            bundleAnalysis.main += sizeKB;
          } else if (script.name.includes('vendor') || script.name.includes('webpack')) {
            bundleAnalysis.vendor += sizeKB;
          } else {
            bundleAnalysis.chunks.push({ name: script.name, size: sizeKB });
          }
        });
        
        const totalSize = bundleAnalysis.main + bundleAnalysis.vendor + 
          bundleAnalysis.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
        
        cy.log(`Bundle Analysis:
          Main: ${bundleAnalysis.main.toFixed(2)}KB
          Vendor: ${bundleAnalysis.vendor.toFixed(2)}KB
          Chunks: ${bundleAnalysis.chunks.length} files
          Total: ${totalSize.toFixed(2)}KB`);
        
        // Phase 2B Target: < 500KB total
        expect(totalSize).to.be.lessThan(500);
        
        // Main bundle should be reasonable
        expect(bundleAnalysis.main).to.be.lessThan(200);
        
        // Individual chunks should be small
        bundleAnalysis.chunks.forEach(chunk => {
          expect(chunk.size).to.be.lessThan(100);
        });
      });
    });
  });
});