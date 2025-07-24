/**
 * Phase 2B E2E Tests: Critical User Journey - Complete Registration Flow
 * Tests the complete user registration and onboarding process
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 2B: Complete User Registration Journey', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete user registration flow - Artist', async () => {
    // 1. Homepage interaction
    await test.step('Visit homepage and start registration', async () => {
      await expect(page.locator('h1')).toContainText(/Open.*Network/i);
      
      // Click signup button
      await page.click('text=Sign Up');
      await expect(page).toHaveURL(/.*signup/);
    });

    // 2. Create account
    await test.step('Fill registration form', async () => {
      const timestamp = Date.now();
      const testEmail = `test-artist-${timestamp}@example.com`;
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
      
      // Accept terms
      await page.check('input[type="checkbox"]');
      
      await page.click('button[type="submit"]');
      
      // Should redirect to role selection or email verification
      await page.waitForURL(/.*set-role|.*verify/);
    });

    // 3. Role selection
    await test.step('Select Artist role', async () => {
      // If redirected to role selection
      if (page.url().includes('set-role')) {
        await page.click('text=Artist');
        await page.click('button:has-text("Continue")');
        await page.waitForURL(/.*onboarding/);
      }
    });

    // 4. Complete onboarding
    await test.step('Complete artist onboarding', async () => {
      // Fill basic profile information
      await page.fill('input[name="displayName"]', 'Test Artist');
      await page.fill('textarea[name="bio"]', 'Professional artist with 5+ years of experience');
      
      // Select genres (if genre selection exists)
      const genreSelector = page.locator('text=Hip Hop');
      if (await genreSelector.isVisible()) {
        await genreSelector.click();
      }
      
      // Continue to next step
      await page.click('button:has-text("Continue")');
      
      // Complete additional steps (location, services, etc.)
      const locationInput = page.locator('input[placeholder*="location" i]');
      if (await locationInput.isVisible()) {
        await locationInput.fill('Los Angeles, CA');
      }
      
      // Finish onboarding
      const finishButton = page.locator('button:has-text("Finish"), button:has-text("Complete")');
      if (await finishButton.isVisible()) {
        await finishButton.click();
      }
      
      // Should redirect to dashboard
      await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    });

    // 5. Verify dashboard access
    await test.step('Verify artist dashboard access', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Check for artist-specific elements
      await expect(page.locator('text=Dashboard')).toBeVisible();
      
      // Verify navigation menu
      const navItems = ['Home', 'Bookings', 'Profile', 'Messages'];
      for (const item of navItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
    });
  });

  test('Complete user registration flow - Client', async () => {
    await test.step('Register as client and verify dashboard', async () => {
      await page.click('text=Sign Up');
      
      const timestamp = Date.now();
      const testEmail = `test-client-${timestamp}@example.com`;
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
      await page.check('input[type="checkbox"]');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/.*set-role|.*verify|.*dashboard/);
      
      // Select Client role if needed
      if (page.url().includes('set-role')) {
        await page.click('text=Client');
        await page.click('button:has-text("Continue")');
      }
      
      // Complete minimal client onboarding
      const nameInput = page.locator('input[name="displayName"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Client');
        await page.click('button:has-text("Continue"), button:has-text("Finish")');
      }
      
      // Verify client dashboard
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Find Creators')).toBeVisible();
    });
  });

  test('Registration form validation', async () => {
    await test.step('Test form validation errors', async () => {
      await page.click('text=Sign Up');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('text=required')).toBeVisible();
      
      // Test password mismatch
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword!');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=match')).toBeVisible();
    });
  });

  test('Email verification flow (if implemented)', async () => {
    await test.step('Handle email verification', async () => {
      // This test would verify the email verification process
      // Skip if not implemented or in test environment
      test.skip(!process.env.TEST_EMAIL_VERIFICATION, 'Email verification not configured for testing');
    });
  });

  test('Mobile responsiveness - Registration', async () => {
    await test.step('Test registration on mobile', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('text=Sign Up');
      
      // Verify mobile layout
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Test mobile form interaction
      await page.fill('input[type="email"]', 'mobile-test@example.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      // Verify form is usable on mobile
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      
      // Check for proper mobile styling
      const boundingBox = await submitButton.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(40); // Touch-friendly button height
    });
  });
});