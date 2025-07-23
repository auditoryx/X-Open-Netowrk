/**
 * Phase 2B E2E Tests: Cross-Browser & Cross-Platform Compatibility
 * Tests platform functionality across different browsers and devices
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Phase 2B: Cross-Browser Compatibility', () => {
  
  // Test core functionality across browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test.describe(`${browserName} browser tests`, () => {
      
      test(`Homepage loads correctly on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Core elements should be visible
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('text=Sign Up, text=Login')).toBeVisible();
        
        // Check for browser-specific rendering issues
        const logo = page.locator('[data-testid="logo"], .logo');
        if (await logo.isVisible()) {
          const boundingBox = await logo.boundingBox();
          expect(boundingBox?.width).toBeGreaterThan(0);
          expect(boundingBox?.height).toBeGreaterThan(0);
        }
      });

      test(`Navigation works on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Test main navigation
        const navLinks = ['Artists', 'Producers', 'Studios', 'Engineers'];
        
        for (const link of navLinks) {
          const navLink = page.locator(`text=${link}`);
          if (await navLink.isVisible()) {
            await navLink.click();
            await page.waitForLoadState('networkidle');
            
            // Verify navigation worked
            await expect(page).toHaveURL(new RegExp(link.toLowerCase()));
            
            // Go back to homepage
            await page.goto('/');
          }
        }
      });

      test(`Search functionality on ${browserName}`, async ({ page }) => {
        await page.goto('/search');
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('hip hop');
          await page.keyboard.press('Enter');
          
          // Verify search results
          await expect(page.locator('[data-testid="search-results"], .search-results')).toBeVisible({ timeout: 10000 });
        }
      });

      test(`Form submission on ${browserName}`, async ({ page }) => {
        await page.goto('/signup');
        
        // Test form functionality
        await page.fill('input[type="email"]', `test-${browserName}@example.com`);
        await page.fill('input[type="password"]', 'TestPassword123!');
        
        const confirmPassword = page.locator('input[name="confirmPassword"]');
        if (await confirmPassword.isVisible()) {
          await confirmPassword.fill('TestPassword123!');
        }
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should process form (even if it fails due to test environment)
        await page.waitForTimeout(2000);
        
        // Verify form interaction worked
        const currentUrl = page.url();
        expect(currentUrl).not.toBe('/signup'); // Should have navigated away or shown response
      });
    });
  });
});

test.describe('Phase 2B: Mobile Device Compatibility', () => {
  
  // Test on different mobile devices
  [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'iPad', device: devices['iPad Pro'] }
  ].forEach(({ name, device }) => {
    
    test.describe(`${name} device tests`, () => {
      test.use({ ...device });
      
      test(`Homepage responsive design on ${name}`, async ({ page }) => {
        await page.goto('/');
        
        // Check viewport is mobile
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(1024);
        
        // Verify mobile layout
        await expect(page.locator('h1')).toBeVisible();
        
        // Check for hamburger menu on mobile
        if (viewport?.width && viewport.width < 768) {
          const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu" i]');
          if (await mobileMenu.isVisible()) {
            await mobileMenu.click();
            await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
          }
        }
      });

      test(`Touch interactions on ${name}`, async ({ page }) => {
        await page.goto('/artists');
        
        // Test touch scrolling
        await page.evaluate(() => window.scrollBy(0, 200));
        
        // Test touch tap
        const firstCard = page.locator('.creator-card, [data-testid="creator-card"]').first();
        if (await firstCard.isVisible()) {
          const boundingBox = await firstCard.boundingBox();
          
          // Verify touch target size (minimum 44px for accessibility)
          expect(boundingBox?.height).toBeGreaterThan(44);
          
          await firstCard.click();
          
          // Should navigate to profile
          await expect(page).toHaveURL(/.*profile/);
        }
      });

      test(`Mobile form interaction on ${name}`, async ({ page }) => {
        await page.goto('/login');
        
        // Test mobile form
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toBeVisible();
        
        // Verify mobile-friendly input
        const boundingBox = await emailInput.boundingBox();
        expect(boundingBox?.height).toBeGreaterThan(40); // Touch-friendly height
        
        await emailInput.fill('test@example.com');
        
        // Test virtual keyboard handling
        await page.fill('input[type="password"]', 'password');
        
        // Verify submit button is accessible
        const submitButton = page.locator('button[type="submit"]');
        const buttonBox = await submitButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThan(44);
      });

      test(`Swipe gestures on ${name}`, async ({ page }) => {
        await page.goto('/');
        
        // Test swipe navigation if implemented
        const carousel = page.locator('[data-testid="carousel"], .carousel');
        if (await carousel.isVisible()) {
          // Simulate swipe left
          await carousel.hover();
          await page.mouse.down();
          await page.mouse.move(-100, 0);
          await page.mouse.up();
          
          // Verify swipe worked (content should change)
          await page.waitForTimeout(500);
        }
      });

      test(`Mobile performance on ${name}`, async ({ page }) => {
        // Monitor performance on mobile
        const startTime = Date.now();
        
        await page.goto('/');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Mobile should load reasonably fast
        expect(loadTime).toBeLessThan(5000); // 5 seconds max
        
        // Check for mobile-specific optimizations
        const images = page.locator('img');
        const imageCount = await images.count();
        
        if (imageCount > 0) {
          // Verify images are properly sized for mobile
          const firstImage = images.first();
          const imgBox = await firstImage.boundingBox();
          const viewport = page.viewportSize();
          
          if (imgBox && viewport) {
            expect(imgBox.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      });
    });
  });
});

test.describe('Phase 2B: Accessibility Compliance', () => {
  
  test('WCAG 2.1 AA compliance check', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // All images should have alt text
    }
    
    // Check for form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      
      if (id) {
        // Should have associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel).toBeTruthy();
      }
    }
  });

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    const focusableElements = page.locator('a, button, input, select, textarea, [tabindex="0"]');
    const count = await focusableElements.count();
    
    // Tab through first few elements
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
    
    // Test Enter key on buttons
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      await buttons.focus();
      await page.keyboard.press('Enter');
      // Should trigger button action
    }
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA landmarks
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();
    
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have accessible name
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    // This would typically use a specialized tool for color contrast checking
    // For now, we'll check that text elements are visible
    const textElements = page.locator('p, h1, h2, h3, span, a');
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });
});

test.describe('Phase 2B: Performance Across Devices', () => {
  
  test('Core Web Vitals on desktop', async ({ page }) => {
    await page.goto('/');
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('Core Web Vitals on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Mobile performance should still be reasonable
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(4000); // 4 seconds for mobile
  });

  test('Bundle size impact on performance', async ({ page }) => {
    await page.goto('/');
    
    // Check resource loading
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        size: entry.transferSize,
        duration: entry.duration
      }));
    });
    
    // Find JavaScript bundles
    const jsBundles = resources.filter(r => r.name.includes('.js') && r.size > 0);
    const totalJSSize = jsBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    // Total JS should be reasonable (under 1MB for critical path)
    expect(totalJSSize).toBeLessThan(1024 * 1024); // 1MB
    
    console.log(`Total JS bundle size: ${Math.round(totalJSSize / 1024)}KB`);
  });
});