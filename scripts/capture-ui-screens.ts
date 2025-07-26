import { test, expect, Page, Browser } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Screenshot configuration
const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots');
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface UserTierData {
  tier: 'standard' | 'verified' | 'signature';
  email: string;
  displayName: string;
  bio: string;
  services: string[];
}

// Test user data for each tier
const TEST_USERS: Record<string, UserTierData> = {
  standard: {
    tier: 'standard',
    email: 'standard.user@test.com',
    displayName: 'Alex Producer',
    bio: 'Aspiring music producer specializing in electronic beats',
    services: ['Beat Production', 'Audio Mixing']
  },
  verified: {
    tier: 'verified',
    email: 'verified.user@test.com', 
    displayName: 'Jordan Engineer',
    bio: 'Professional audio engineer with 5+ years experience in studio production',
    services: ['Mixing', 'Mastering', 'Post Production']
  },
  signature: {
    tier: 'signature',
    email: 'signature.user@test.com',
    displayName: 'Morgan Master',
    bio: 'Grammy-nominated mixing engineer and producer with credits on 100+ releases',
    services: ['Premium Mixing', 'Mastering', 'Production Consultation', 'Mentorship']
  }
};

/**
 * Helper function to take standardized screenshots
 */
async function takeScreenshot(page: Page, filename: string, options?: {
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
}) {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${filename}.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: options?.fullPage || false,
    clip: options?.clip,
    type: 'png'
  });
  console.log(`📸 Screenshot saved: ${filename}.png`);
}

/**
 * Setup mock user data for testing
 */
async function setupMockUser(page: Page, userData: UserTierData) {
  // Navigate to signup/mock setup page
  await page.goto(`${BASE_URL}/test-setup`);
  
  // If the test setup page doesn't exist, use local storage to mock user state
  await page.evaluate((user) => {
    localStorage.setItem('mockUser', JSON.stringify({
      id: `user_${user.tier}_${Date.now()}`,
      tier: user.tier,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      services: user.services,
      isVerified: user.tier !== 'standard',
      verificationBadge: user.tier === 'verified' ? 'verified' : user.tier === 'signature' ? 'signature' : null,
      profileComplete: user.tier !== 'standard',
      portfolioItems: user.tier === 'signature' ? 25 : user.tier === 'verified' ? 10 : 3
    }));
  }, userData);
}

test.describe('AuditoryX UI Screenshots - Tier Showcase', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Homepage and Navigation - All Tiers', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take homepage screenshot
    await takeScreenshot(page, 'homepage-hero', { fullPage: true });
    
    // Take navigation screenshot
    await takeScreenshot(page, 'navigation-header', {
      clip: { x: 0, y: 0, width: 1440, height: 100 }
    });
  });

  test('Search and Discovery Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    // Take search page screenshot
    await takeScreenshot(page, 'search-page-overview', { fullPage: true });
    
    // Test search filters
    const tierFilter = page.locator('[data-testid="tier-filter"]');
    if (await tierFilter.isVisible()) {
      await tierFilter.click();
      await takeScreenshot(page, 'search-tier-filters');
    }
    
    // Search results with different tiers
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('audio engineer');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'search-results-mixed-tiers');
    }
  });

  test('Standard Tier User Experience', async ({ page }) => {
    await setupMockUser(page, TEST_USERS.standard);
    
    // Profile page
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'profile-standard-tier', { fullPage: true });
    
    // Creator card in search results
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'creator-card-standard-tier');
    
    // Booking limitations
    await page.goto(`${BASE_URL}/booking/new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'booking-standard-limitations');
  });

  test('Verified Tier User Experience', async ({ page }) => {
    await setupMockUser(page, TEST_USERS.verified);
    
    // Profile with verification badge
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'profile-verified-tier', { fullPage: true });
    
    // Verified badge in search
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'creator-card-verified-badge');
    
    // Enhanced booking features
    await page.goto(`${BASE_URL}/booking/new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'booking-verified-features');
    
    // Calendar integration
    const calendarSection = page.locator('[data-testid="calendar-integration"]');
    if (await calendarSection.isVisible()) {
      await takeScreenshot(page, 'calendar-integration-verified');
    }
  });

  test('Signature Tier User Experience', async ({ page }) => {
    await setupMockUser(page, TEST_USERS.signature);
    
    // Premium profile layout
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'profile-signature-tier', { fullPage: true });
    
    // Signature badge and priority placement
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'creator-card-signature-star');
    
    // Advanced booking capabilities
    await page.goto(`${BASE_URL}/booking/new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'booking-signature-unlimited');
    
    // Analytics dashboard
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'analytics-signature-dashboard', { fullPage: true });
  });

  test('KYC Verification Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/verification`);
    await page.waitForLoadState('networkidle');
    
    // Verification landing page
    await takeScreenshot(page, 'kyc-verification-start');
    
    // Document upload interface
    const uploadSection = page.locator('[data-testid="document-upload"]');
    if (await uploadSection.isVisible()) {
      await takeScreenshot(page, 'kyc-document-upload');
    }
    
    // Verification status page
    await page.goto(`${BASE_URL}/verification/status`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'kyc-verification-status');
  });

  test('Booking Flow - Multi-Creator Collaboration', async ({ page }) => {
    await setupMockUser(page, TEST_USERS.signature);
    
    await page.goto(`${BASE_URL}/booking/new`);
    await page.waitForLoadState('networkidle');
    
    // Initial booking form
    await takeScreenshot(page, 'booking-flow-step-1');
    
    // Multi-creator selection
    const addCollaboratorBtn = page.locator('[data-testid="add-collaborator"]');
    if (await addCollaboratorBtn.isVisible()) {
      await addCollaboratorBtn.click();
      await takeScreenshot(page, 'booking-multi-creator-selection');
    }
    
    // Revenue splitting configuration
    const revenueSplitSection = page.locator('[data-testid="revenue-split"]');
    if (await revenueSplitSection.isVisible()) {
      await takeScreenshot(page, 'booking-revenue-splitting');
    }
    
    // Confirmation page
    await page.goto(`${BASE_URL}/booking/confirm`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'booking-confirmation-page');
  });

  test('Chat and Communication Features', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    await page.waitForLoadState('networkidle');
    
    // Chat interface overview
    await takeScreenshot(page, 'chat-interface-overview', { fullPage: true });
    
    // Encrypted chat indicator
    const encryptionIndicator = page.locator('[data-testid="encryption-status"]');
    if (await encryptionIndicator.isVisible()) {
      await takeScreenshot(page, 'chat-encryption-indicator');
    }
  });

  test('Admin Verification Panel', async ({ page }) => {
    // Mock admin user
    await page.evaluate(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        id: 'admin_user',
        role: 'admin',
        permissions: ['user_verification', 'platform_management']
      }));
    });
    
    await page.goto(`${BASE_URL}/admin/verification`);
    await page.waitForLoadState('networkidle');
    
    // Admin verification dashboard
    await takeScreenshot(page, 'admin-verification-dashboard', { fullPage: true });
    
    // User verification review
    const verificationItem = page.locator('[data-testid="verification-item"]').first();
    if (await verificationItem.isVisible()) {
      await verificationItem.click();
      await takeScreenshot(page, 'admin-verification-review');
    }
  });

  test('Mobile Responsive Views', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Homepage mobile
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'mobile-homepage');
    
    // Search mobile
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'mobile-search-page');
    
    // Profile mobile (verified user)
    await setupMockUser(page, TEST_USERS.verified);
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'mobile-profile-verified');
  });

  test('Tier Comparison and Upgrade Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/tiers`);
    await page.waitForLoadState('networkidle');
    
    // Tier comparison table
    await takeScreenshot(page, 'tier-comparison-table', { fullPage: true });
    
    // Upgrade flow
    const upgradeBtn = page.locator('[data-testid="upgrade-to-verified"]');
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
      await takeScreenshot(page, 'tier-upgrade-flow');
    }
  });

});

test.describe('Screenshot Generation Summary', () => {
  test('Generate README for screenshots', async () => {
    const screenshotReadme = `# AuditoryX Open Network - UI Screenshots

This directory contains automatically generated screenshots showcasing the platform's user interface across different user tiers and key features.

## Generated Screenshots

### Homepage and Navigation
- \`homepage-hero.png\` - Main landing page overview
- \`navigation-header.png\` - Platform navigation header

### User Tiers Showcase
- \`profile-standard-tier.png\` - Standard tier user profile
- \`profile-verified-tier.png\` - Verified tier with blue checkmark badge
- \`profile-signature-tier.png\` - Signature tier with gold star badge
- \`creator-card-standard-tier.png\` - Standard user in search results
- \`creator-card-verified-badge.png\` - Verified badge display
- \`creator-card-signature-star.png\` - Signature star display

### Search and Discovery
- \`search-page-overview.png\` - Main search interface
- \`search-tier-filters.png\` - Tier-based filtering options
- \`search-results-mixed-tiers.png\` - Mixed tier search results

### Booking and Collaboration
- \`booking-standard-limitations.png\` - Standard tier booking limits
- \`booking-verified-features.png\` - Verified tier enhanced features
- \`booking-signature-unlimited.png\` - Signature tier capabilities
- \`booking-multi-creator-selection.png\` - Multi-creator project setup
- \`booking-revenue-splitting.png\` - Revenue split configuration
- \`booking-confirmation-page.png\` - Booking confirmation interface

### Verification and Trust
- \`kyc-verification-start.png\` - KYC verification landing
- \`kyc-document-upload.png\` - Document upload interface
- \`kyc-verification-status.png\` - Verification status page
- \`admin-verification-dashboard.png\` - Admin verification panel
- \`admin-verification-review.png\` - Individual verification review

### Communication Features
- \`chat-interface-overview.png\` - Main messaging interface
- \`chat-encryption-indicator.png\` - End-to-end encryption status

### Advanced Features
- \`analytics-signature-dashboard.png\` - Signature tier analytics
- \`calendar-integration-verified.png\` - Calendar sync features
- \`tier-comparison-table.png\` - Tier comparison overview
- \`tier-upgrade-flow.png\` - Upgrade process interface

### Mobile Responsive
- \`mobile-homepage.png\` - Homepage mobile view
- \`mobile-search-page.png\` - Search mobile interface
- \`mobile-profile-verified.png\` - Mobile profile with verification

## Usage Instructions

### Regenerating Screenshots
Run the Playwright script to regenerate all screenshots:

\`\`\`bash
npx playwright test scripts/capture-ui-screens.ts
\`\`\`

### Prerequisites
1. Start the development server: \`npm run dev\`
2. Ensure test data is seeded for different user tiers
3. Install Playwright browsers: \`npx playwright install\`

### Configuration
- Screenshots are taken at 1440x900 resolution for desktop
- Mobile screenshots use 375x667 resolution
- All images are saved as PNG format for best quality

## Integration with Documentation
These screenshots are referenced in:
- [Executive Overview](../executive-overview.md)
- [Platform Overview Slides](../platform-overview-slides.md)
- [Tiers and Badges Documentation](../tiers-and-badges.md)

*Screenshots last generated: ${new Date().toISOString()}*
`;

    const readmePath = path.join(SCREENSHOT_DIR, 'README.md');
    fs.writeFileSync(readmePath, screenshotReadme);
    console.log('📝 Generated screenshots README.md');
  });
});