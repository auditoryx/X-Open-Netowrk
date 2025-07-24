/**
 * Phase 2B E2E Tests: Payment Processing & Stripe Integration
 * Tests all payment scenarios including success, failure, and edge cases
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 2B: Payment Processing & Stripe Integration', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Helper to navigate to payment step
  async function navigateToPayment() {
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_CLIENT_EMAIL || 'test-client@example.com');
    await page.fill('input[type="password"]', process.env.TEST_CLIENT_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to booking
    await page.goto('/artists');
    await page.click('.creator-card:first-child, [data-testid="creator-card"]:first-child');
    await page.click('text=Book');
    
    // Fill minimal booking details
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Payment Booking');
      await page.click('button:has-text("Continue"), button:has-text("Next")');
      await page.click('button:has-text("Pay"), button:has-text("Proceed")');
    }
  }

  test('Successful payment with valid card', async () => {
    await test.step('Complete successful payment flow', async () => {
      await navigateToPayment();
      
      // Wait for Stripe form to load
      await page.waitForSelector('iframe[src*="stripe"], [data-testid="stripe-form"]', { timeout: 10000 });
      
      // Fill valid test card
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
        await stripeFrame.locator('input[name="postal"]').fill('90210');
      }
      
      // Submit payment
      await page.click('button:has-text("Pay"), button:has-text("Complete Payment")');
      
      // Verify success
      await page.waitForURL(/.*success|.*confirmation/, { timeout: 15000 });
      await expect(page.locator('text=success, text=confirmed')).toBeVisible();
      await expect(page.locator('[data-testid="booking-reference"], text=#')).toBeVisible();
    });
  });

  test('Payment failure - Declined card', async () => {
    await test.step('Handle declined card gracefully', async () => {
      await navigateToPayment();
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      // Fill declined test card
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000000000000002'); // Declined card
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
      }
      
      await page.click('button:has-text("Pay")');
      
      // Verify error handling
      await expect(page.locator('text=declined, text=payment.*failed')).toBeVisible({ timeout: 10000 });
      
      // Verify user can retry
      await expect(page.locator('button:has-text("Try Again"), button:has-text("Retry")')).toBeVisible();
    });
  });

  test('Payment failure - Insufficient funds', async () => {
    await test.step('Handle insufficient funds error', async () => {
      await navigateToPayment();
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000000000009995'); // Insufficient funds
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
      }
      
      await page.click('button:has-text("Pay")');
      
      await expect(page.locator('text=insufficient, text=funds')).toBeVisible({ timeout: 10000 });
    });
  });

  test('Payment validation - Invalid card numbers', async () => {
    await test.step('Test form validation for invalid cards', async () => {
      await navigateToPayment();
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      // Test invalid card number
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('1234567890123456');
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
      }
      
      await page.click('button:has-text("Pay")');
      
      // Should show validation error
      await expect(page.locator('text=invalid, text=card')).toBeVisible({ timeout: 5000 });
    });
  });

  test('Payment security - CVC verification', async () => {
    await test.step('Test CVC verification failure', async () => {
      await navigateToPayment();
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000000000000127'); // CVC check fails
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
      }
      
      await page.click('button:has-text("Pay")');
      
      await expect(page.locator('text=security.*code, text=cvc')).toBeVisible({ timeout: 10000 });
    });
  });

  test('Payment form accessibility', async () => {
    await test.step('Verify payment form accessibility', async () => {
      await navigateToPayment();
      
      // Check for proper labels and ARIA attributes
      await expect(page.locator('label[for*="card"], [aria-label*="card"]')).toBeVisible();
      
      // Verify keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check focus indicators
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test('Payment form mobile responsiveness', async () => {
    await test.step('Test payment form on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await navigateToPayment();
      
      // Verify mobile layout
      const paymentForm = page.locator('form, [data-testid="payment-form"]');
      await expect(paymentForm).toBeVisible();
      
      // Check Stripe elements mobile compatibility
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      const cardInput = stripeFrame.locator('input[name="cardnumber"]');
      
      if (await cardInput.isVisible()) {
        const boundingBox = await cardInput.boundingBox();
        expect(boundingBox?.height).toBeGreaterThan(40); // Touch-friendly
      }
    });
  });

  test('Payment webhook handling', async () => {
    await test.step('Verify payment webhook processing', async () => {
      // This test would verify webhook handling
      // In a real scenario, you'd monitor webhook endpoints
      test.skip(!process.env.TEST_WEBHOOKS, 'Webhook testing not configured');
      
      await navigateToPayment();
      
      // Complete payment
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
      }
      
      await page.click('button:has-text("Pay")');
      
      // Wait for webhook processing
      await page.waitForTimeout(2000);
      
      // Verify booking status updated
      await page.goto('/dashboard/bookings');
      await expect(page.locator('text=confirmed, text=paid')).toBeVisible();
    });
  });

  test('International payment support', async () => {
    await test.step('Test international cards', async () => {
      await navigateToPayment();
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      
      // Test international card (UK)
      if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000008260000000'); // UK Visa
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
        await stripeFrame.locator('input[name="postal"]').fill('SW1A 1AA');
      }
      
      await page.click('button:has-text("Pay")');
      
      // Should handle international payment
      await page.waitForURL(/.*success/, { timeout: 15000 });
      await expect(page.locator('text=success')).toBeVisible();
    });
  });

  test('Payment timeout handling', async () => {
    await test.step('Test payment timeout scenarios', async () => {
      await navigateToPayment();
      
      // Simulate slow connection
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 5000);
      });
      
      await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
      
      // Verify timeout handling
      await expect(page.locator('text=loading, text=processing')).toBeVisible();
      
      // Should show appropriate timeout message if payment takes too long
      await expect(page.locator('button:has-text("Pay")')).toBeDisabled();
    });
  });

  test('Payment refund flow (if implemented)', async () => {
    await test.step('Test payment refund process', async () => {
      test.skip(!process.env.TEST_REFUNDS, 'Refund testing not implemented');
      
      // This would test the refund flow if implemented
      // 1. Complete a successful payment
      // 2. Navigate to booking management
      // 3. Initiate refund
      // 4. Verify refund processing
    });
  });

  test('Multiple payment methods', async () => {
    await test.step('Test different payment methods', async () => {
      await navigateToPayment();
      
      // Test different card types
      const testCards = [
        { number: '4242424242424242', type: 'Visa' },
        { number: '5555555555554444', type: 'Mastercard' },
        { number: '378282246310005', type: 'American Express' }
      ];
      
      for (const card of testCards) {
        await page.reload();
        await navigateToPayment();
        
        await page.waitForSelector('iframe[src*="stripe"]', { timeout: 10000 });
        
        const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
        
        if (await stripeFrame.locator('input[name="cardnumber"]').isVisible()) {
          await stripeFrame.locator('input[name="cardnumber"]').fill(card.number);
          await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
          await stripeFrame.locator('input[name="cvc"]').fill('123');
          
          // Should detect card type
          await expect(page.locator(`text=${card.type}`)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});