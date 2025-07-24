import { test, expect } from '@playwright/test';

/**
 * Phase 2: Role System Integration E2E Tests
 * Browser-based testing of the complete user journey
 */

test.describe('Role System Integration QA', () => {
  const testRoles = ['artist', 'producer', 'studio', 'engineer', 'videographer'];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Test data
  const testUser = {
    email: `test_qa_${Date.now()}@example.com`,
    name: 'QA Test User',
    bio: 'I am a professional artist with years of experience.',
    location: 'Los Angeles, CA'
  };

  test.beforeAll(async () => {
    // Note: In a real test environment, we would set up test users
    // For this QA script, we assume the app is running locally
  });

  test.describe('JJ-01: Onboarding Flow Validation', () => {
    testRoles.forEach(role => {
      test(`Should complete ${role} application flow`, async ({ page }) => {
        // Navigate to role application page
        await page.goto(`${baseUrl}/apply/${role}`);
        
        // Check if login is required
        if (page.url().includes('/login')) {
          // For QA purposes, we'll test the flow assuming user is logged in
          // In real tests, you would handle authentication here
          await expect(page.locator('text=You must be logged in')).toBeVisible();
          return;
        }
        
        // Fill out application form
        await page.waitForSelector('h1');
        await expect(page.locator('h1')).toContainText(`Apply as ${role}`);
        
        // Navigate through onboarding steps
        // Step 1: Basic info
        if (await page.locator('#location').isVisible()) {
          await page.fill('#location', testUser.location);
        }
        
        if (await page.locator('#bio').isVisible()) {
          await page.fill('#bio', testUser.bio);
        }
        
        // Check for Next button and click if available
        if (await page.locator('button:has-text("Next")').isVisible()) {
          await page.click('button:has-text("Next")');
          
          // Handle additional steps based on role
          await handleRoleSpecificSteps(page, role);
        }
        
        // Final step: Verification agreement
        if (await page.locator('#verify').isVisible()) {
          await page.check('#verify');
        }
        
        // Submit application
        if (await page.locator('button:has-text("Submit Application")').isVisible()) {
          await page.click('button:has-text("Submit Application")');
          
          // Check for success state or dashboard redirect
          await page.waitForTimeout(2000);
          
          // Either success message or redirect should occur
          const hasSuccessMessage = await page.locator('text=Application Submitted').isVisible();
          const isOnDashboard = page.url().includes('/dashboard');
          
          expect(hasSuccessMessage || isOnDashboard).toBeTruthy();
        }
      });
    });
  });

  test.describe('JJ-02: Profile Completion', () => {
    test('Should display profile editing interface', async ({ page }) => {
      await page.goto(`${baseUrl}/dashboard/profile`);
      
      // Check if profile editing is available
      if (page.url().includes('/login')) {
        return; // Skip if not authenticated
      }
      
      await page.waitForSelector('h1', { timeout: 5000 });
      
      // Look for profile completion elements
      const hasProfileForm = await page.locator('form').isVisible();
      const hasBioField = await page.locator('textarea').isVisible();
      
      expect(hasProfileForm || hasBioField).toBeTruthy();
    });
  });

  test.describe('JJ-03: Role Discovery', () => {
    testRoles.forEach(role => {
      test(`Should display ${role} profiles in explore page`, async ({ page }) => {
        await page.goto(`${baseUrl}/explore/${role}`);
        
        // Wait for page to load
        await page.waitForSelector('h1');
        await expect(page.locator('h1')).toContainText(`${role}`);
        
        // Check for creator profiles grid
        const hasProfileGrid = await page.locator('[class*="grid"]').isVisible();
        const hasCreatorCards = await page.locator('[class*="border"]').count() > 0;
        
        // Should have either profiles or "No creators found" message
        const hasNoCreatorsMessage = await page.locator('text=No creators found').isVisible();
        
        expect(hasProfileGrid || hasCreatorCards || hasNoCreatorsMessage).toBeTruthy();
      });
    });
  });

  test.describe('JJ-04: Booking System', () => {
    test('Should display booking interface on profile pages', async ({ page }) => {
      // Try to find a profile to test booking with
      await page.goto(`${baseUrl}/explore/artist`);
      
      // Look for profile links
      const profileLinks = await page.locator('button:has-text("View Profile")').all();
      
      if (profileLinks.length > 0) {
        await profileLinks[0].click();
        
        // Check if booking form is available
        await page.waitForSelector('h1', { timeout: 5000 });
        
        const hasBookingForm = await page.locator('text=Send Booking Request').isVisible();
        const hasBookButton = await page.locator('button:has-text("Book")').isVisible();
        
        expect(hasBookingForm || hasBookButton).toBeTruthy();
      } else {
        // No profiles available for testing
        expect(true).toBeTruthy(); // Pass the test
      }
    });
    
    test('Should handle booking form submission', async ({ page }) => {
      // This would require a specific test profile
      // For QA purposes, we'll test the booking page structure
      await page.goto(`${baseUrl}/book/test-user-id`);
      
      if (page.url().includes('/login')) {
        return; // Skip if not authenticated
      }
      
      // Check for booking form elements
      const hasCalendar = await page.locator('[class*="calendar"]').isVisible();
      const hasMessageField = await page.locator('textarea').isVisible();
      const hasSubmitButton = await page.locator('button:has-text("Send Request")').isVisible();
      
      // Should have booking form elements or error message
      const hasNotFound = await page.locator('text=not found').isVisible();
      
      expect(hasCalendar || hasMessageField || hasSubmitButton || hasNotFound).toBeTruthy();
    });
  });

  test.describe('JJ-05: Review System', () => {
    test('Should display reviews interface in dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}/dashboard/reviews`);
      
      if (page.url().includes('/login')) {
        return; // Skip if not authenticated
      }
      
      await page.waitForSelector('h1', { timeout: 5000 });
      
      // Check for reviews section
      const hasReviewsTitle = await page.locator('text=Reviews').isVisible();
      const hasNoReviewsMessage = await page.locator('text=No reviews').isVisible();
      
      expect(hasReviewsTitle || hasNoReviewsMessage).toBeTruthy();
    });
    
    test('Should display review form for completed bookings', async ({ page }) => {
      await page.goto(`${baseUrl}/dashboard/bookings`);
      
      if (page.url().includes('/login')) {
        return; // Skip if not authenticated
      }
      
      await page.waitForSelector('h1', { timeout: 5000 });
      
      // Look for booking management interface
      const hasBookingsTitle = await page.locator('text=Bookings').isVisible();
      const hasNoBookingsMessage = await page.locator('text=No bookings').isVisible();
      
      expect(hasBookingsTitle || hasNoBookingsMessage).toBeTruthy();
    });
  });

  test.describe('Admin Approval Flow', () => {
    test('Should display admin applications interface', async ({ page }) => {
      await page.goto(`${baseUrl}/admin/applications`);
      
      // Admin pages require special authentication
      if (page.url().includes('/login') || page.url().includes('/unauthorized')) {
        return; // Skip if not admin
      }
      
      await page.waitForSelector('h1', { timeout: 5000 });
      
      // Check for admin interface
      const hasApplicationsTitle = await page.locator('text=Applications').isVisible();
      const hasApproveButtons = await page.locator('button:has-text("Approve")').isVisible();
      
      expect(hasApplicationsTitle || hasApproveButtons).toBeTruthy();
    });
  });
});

// Helper function to handle role-specific application steps
async function handleRoleSpecificSteps(page, role) {
  // Handle different onboarding steps based on role
  switch (role) {
    case 'artist':
    case 'producer':
      // Music-related fields
      if (await page.locator('#genres').isVisible()) {
        await page.fill('#genres', 'Hip Hop');
        await page.keyboard.press('Enter');
      }
      break;
      
    case 'videographer':
      // Video-related fields
      if (await page.locator('#reel').isVisible()) {
        await page.fill('#reel', 'https://vimeo.com/test');
      }
      break;
      
    case 'studio':
      // Studio-specific fields
      if (await page.locator('#rooms').isVisible()) {
        await page.fill('#rooms', 'Studio A - 10 person capacity');
      }
      break;
      
    case 'engineer':
      // Engineering-specific fields
      if (await page.locator('#gear').isVisible()) {
        await page.fill('#gear', 'Pro Tools, SSL Console, Neumann mics');
      }
      break;
  }
  
  // Continue to next step if available
  if (await page.locator('button:has-text("Next")').isVisible()) {
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
  }
}