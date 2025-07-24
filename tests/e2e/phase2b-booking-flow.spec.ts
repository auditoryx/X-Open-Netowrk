/**
 * Phase 2B E2E Tests: Critical User Journey - Complete Booking Flow
 * Tests the end-to-end booking creation and payment process
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Phase 2B: Complete Booking Flow Journey', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Helper function to complete login (assuming test users exist)
  async function loginAsClient() {
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_CLIENT_EMAIL || 'test-client@example.com');
    await page.fill('input[type="password"]', process.env.TEST_CLIENT_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  }

  test('Complete booking flow - Search to Payment', async () => {
    // 1. Login as client
    await test.step('Login as client', async () => {
      await loginAsClient();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    // 2. Search for creators
    await test.step('Search for creators', async () => {
      // Navigate to search/explore
      await page.click('text=Find Creators, text=Explore, text=Search');
      await expect(page).toHaveURL(/.*explore|.*search|.*artists/);
      
      // Use search functionality
      const searchInput = page.locator('input[placeholder*="search" i]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('hip hop producer');
        await page.press('input[placeholder*="search" i]', 'Enter');
      }
      
      // Verify search results
      await expect(page.locator('[data-testid="creator-card"], .creator-card')).toBeVisible({ timeout: 10000 });
    });

    // 3. Select a creator
    await test.step('Select creator and view profile', async () => {
      // Click on the first creator card
      await page.click('[data-testid="creator-card"]:first-child, .creator-card:first-child');
      
      // Should navigate to creator profile
      await expect(page).toHaveURL(/.*profile/);
      
      // Verify profile elements
      await expect(page.locator('h1, h2')).toContainText(/\w+/); // Creator name
      await expect(page.locator('text=Book, text=Contact')).toBeVisible();
    });

    // 4. Initiate booking
    await test.step('Start booking process', async () => {
      await page.click('text=Book, button:has-text("Book")');
      
      // Should navigate to booking form or modal
      const bookingForm = page.locator('form, [data-testid="booking-form"]');
      await expect(bookingForm).toBeVisible({ timeout: 5000 });
    });

    // 5. Fill booking details
    await test.step('Fill booking form', async () => {
      // Fill project details
      const projectTitleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
      if (await projectTitleInput.isVisible()) {
        await projectTitleInput.fill('Test Hip Hop Track');
      }

      const descriptionTextarea = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');
      if (await descriptionTextarea.isVisible()) {
        await descriptionTextarea.fill('Need a hip hop beat for my upcoming single');
      }

      // Select service type
      const serviceSelect = page.locator('select[name="service"], [data-testid="service-select"]');
      if (await serviceSelect.isVisible()) {
        await serviceSelect.selectOption({ index: 0 });
      }

      // Select date (if calendar picker exists)
      const dateInput = page.locator('input[type="date"], [data-testid="date-picker"]');
      if (await dateInput.isVisible()) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        await dateInput.fill(futureDate.toISOString().split('T')[0]);
      }

      // Continue to next step
      await page.click('button:has-text("Continue"), button:has-text("Next")');
    });

    // 6. Review booking details
    await test.step('Review booking and proceed to payment', async () => {
      // Verify booking summary
      await expect(page.locator('text=Review, text=Summary')).toBeVisible();
      
      // Check for total amount
      await expect(page.locator('text=$, [data-testid="total-amount"]')).toBeVisible();
      
      // Proceed to payment
      await page.click('button:has-text("Proceed"), button:has-text("Pay")');
    });

    // 7. Payment process (Stripe test mode)
    await test.step('Complete payment process', async () => {
      // Wait for Stripe elements to load
      await page.waitForSelector('[data-testid="stripe-form"], iframe[src*="stripe"]', { timeout: 10000 });
      
      // Fill Stripe test card details
      const cardFrame = page.frameLocator('iframe[src*="stripe"]').first();
      if (await cardFrame.locator('input[name="cardnumber"]').isVisible()) {
        await cardFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
        await cardFrame.locator('input[name="exp-date"]').fill('12/25');
        await cardFrame.locator('input[name="cvc"]').fill('123');
      }
      
      // Submit payment
      await page.click('button:has-text("Pay"), button:has-text("Complete")');
      
      // Wait for success page
      await page.waitForURL(/.*success|.*confirmation/, { timeout: 15000 });
    });

    // 8. Verify booking confirmation
    await test.step('Verify booking confirmation', async () => {
      await expect(page.locator('text=Success, text=Confirmed')).toBeVisible();
      await expect(page.locator('text=booking', { ignoreCase: true })).toBeVisible();
      
      // Check for booking ID or reference
      await expect(page.locator('[data-testid="booking-id"], text=#')).toBeVisible();
    });
  });

  test('Booking flow - Service selection and pricing', async () => {
    await test.step('Test service selection and dynamic pricing', async () => {
      await loginAsClient();
      
      // Navigate to a creator profile
      await page.goto('/artists');
      await page.click('.creator-card:first-child');
      await page.click('text=Book');
      
      // Test service selection
      const serviceOptions = page.locator('[data-testid="service-option"], .service-option');
      const count = await serviceOptions.count();
      
      if (count > 0) {
        // Select different services and verify price updates
        for (let i = 0; i < Math.min(count, 3); i++) {
          await serviceOptions.nth(i).click();
          
          // Verify price is displayed
          await expect(page.locator('text=$, [data-testid="price"]')).toBeVisible();
        }
      }
    });
  });

  test('Booking calendar integration', async () => {
    await test.step('Test calendar availability and selection', async () => {
      await loginAsClient();
      
      await page.goto('/artists');
      await page.click('.creator-card:first-child');
      await page.click('text=Book');
      
      // Test calendar interaction
      const calendar = page.locator('[data-testid="calendar"], .calendar');
      if (await calendar.isVisible()) {
        // Click on available date
        const availableDate = page.locator('.available-date, [data-available="true"]').first();
        if (await availableDate.isVisible()) {
          await availableDate.click();
          
          // Verify time slot selection
          await expect(page.locator('text=time, text=slot')).toBeVisible();
        }
      }
    });
  });

  test('Booking flow error handling', async () => {
    await test.step('Test payment failure scenarios', async () => {
      await loginAsClient();
      
      // Go through booking flow
      await page.goto('/artists');
      await page.click('.creator-card:first-child');
      await page.click('text=Book');
      
      // Fill minimal booking details
      const titleInput = page.locator('input[name="title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Booking');
        await page.click('button:has-text("Continue")');
        await page.click('button:has-text("Pay")');
        
        // Use Stripe test card that will be declined
        const cardFrame = page.frameLocator('iframe[src*="stripe"]').first();
        if (await cardFrame.locator('input[name="cardnumber"]').isVisible()) {
          await cardFrame.locator('input[name="cardnumber"]').fill('4000000000000002'); // Declined card
          await cardFrame.locator('input[name="exp-date"]').fill('12/25');
          await cardFrame.locator('input[name="cvc"]').fill('123');
          
          await page.click('button:has-text("Pay")');
          
          // Verify error handling
          await expect(page.locator('text=declined, text=error', { ignoreCase: true })).toBeVisible();
        }
      }
    });
  });

  test('Mobile booking flow', async () => {
    await test.step('Test complete booking flow on mobile', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await loginAsClient();
      
      // Navigate through mobile booking flow
      await page.click('text=Find');
      await page.click('.creator-card:first-child');
      
      // Verify mobile layout
      const bookButton = page.locator('text=Book');
      await expect(bookButton).toBeVisible();
      
      // Test mobile form interaction
      await bookButton.click();
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Verify mobile-friendly elements
      const inputs = page.locator('input, textarea, select');
      const count = await inputs.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const boundingBox = await inputs.nth(i).boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThan(40); // Touch-friendly height
        }
      }
    });
  });

  test('Booking confirmation email flow', async () => {
    await test.step('Verify booking confirmation process', async () => {
      // This would test email confirmation if implemented
      test.skip(!process.env.TEST_EMAIL_NOTIFICATIONS, 'Email notifications not configured for testing');
      
      // Complete a booking and verify confirmation
      await loginAsClient();
      // ... complete booking flow ...
      
      // Verify confirmation page elements
      await expect(page.locator('text=confirmation')).toBeVisible();
      await expect(page.locator('text=email')).toBeVisible();
    });
  });
});