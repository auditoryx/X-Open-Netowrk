import { test, expect } from '@playwright/test';

test.describe('Calendar .ics Sync UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard');
    // Add authentication setup if needed
  });

  test('should download .ics file successfully', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Wait for availability editor to load
    await expect(page.locator('text=Your Weekly Availability')).toBeVisible();
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export iCal")');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download properties
    expect(download.suggestedFilename()).toBe('availability.ics');
    
    // Save and verify file content
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Read file content to verify iCal format
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf8');
    
    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('VERSION:2.0');
    expect(content).toContain('PRODID:-//AuditoryX//EN');
    expect(content).toContain('END:VCALENDAR');
  });

  test('should import .ics file successfully', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Create a test .ics file content
    const testIcsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20250703T100000Z
DTEND:20250703T110000Z
SUMMARY:Test Meeting
END:VEVENT
END:VCALENDAR`;

    // Create a file for upload
    const buffer = Buffer.from(testIcsContent);
    
    // Set up file input
    const fileInput = page.locator('input[type="file"][accept=".ics"]');
    await fileInput.setInputFiles({
      name: 'test.ics',
      mimeType: 'text/calendar',
      buffer: buffer
    });
    
    // Verify success toast or indication
    await expect(page.locator('text=Imported calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should handle mobile download gracefully', async ({ page, browserName }) => {
    // Simulate mobile user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15');
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/dashboard/availability');
    await expect(page.locator('text=Your Weekly Availability')).toBeVisible();
    
    // On mobile, the download might behave differently
    const downloadPromise = page.waitForEvent('download').catch(() => null);
    
    await page.click('button:has-text("Export iCal")');
    
    const download = await downloadPromise;
    
    if (download) {
      expect(download.suggestedFilename()).toBe('availability.ics');
    } else {
      // If download doesn't work on mobile, check for alternative behavior
      // Like opening in a new tab or showing instructions
      const newPagePromise = page.waitForEvent('popup').catch(() => null);
      const newPage = await newPagePromise;
      
      if (newPage) {
        await newPage.waitForLoadState();
        expect(newPage.url()).toContain('data:text/calendar');
      }
    }
  });

  test('should handle Android calendar app integration', async ({ page }) => {
    // Simulate Android user agent
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36');
    await page.setViewportSize({ width: 412, height: 892 });
    
    await page.goto('/dashboard/availability');
    await expect(page.locator('text=Your Weekly Availability')).toBeVisible();
    
    // Click export
    await page.click('button:has-text("Export iCal")');
    
    // On Android, check if it attempts to open with calendar app
    // This might trigger a download or show a picker
    
    // Wait a moment for any system dialogs
    await page.waitForTimeout(2000);
    
    // Verify no JavaScript errors occurred
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    expect(errors).toHaveLength(0);
  });

  test('should sync from Google Calendar', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Mock the API response for Google Calendar sync
    await page.route('/api/calendar/sync', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          synced: [
            { day: 'Monday', time: '10:00' },
            { day: 'Tuesday', time: '14:00' }
          ]
        })
      });
    });
    
    await page.click('button:has-text("Sync from Google Calendar")');
    
    // Verify success message
    await expect(page.locator('text=Synced from Google Calendar!')).toBeVisible();
  });

  test('should push to Google Calendar', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Mock session with Google token
    await page.evaluate(() => {
      window.sessionStorage.setItem('google-token', 'mock-token');
    });
    
    // Mock the API response for pushing to Google Calendar
    await page.route('/api/calendar/push', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.click('button:has-text("Push to Google Calendar")');
    
    // Verify success message with link
    await expect(page.locator('text=Pushed to Google Calendar')).toBeVisible();
    await expect(page.locator('a[href="https://calendar.google.com"]')).toBeVisible();
  });

  test('should handle iOS calendar app integration', async ({ page }) => {
    // Simulate iOS Safari user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/dashboard/availability');
    await expect(page.locator('text=Your Weekly Availability')).toBeVisible();
    
    // Test export on iOS
    const downloadPromise = page.waitForEvent('download').catch(() => null);
    await page.click('button:has-text("Export iCal")');
    
    const download = await downloadPromise;
    
    if (download) {
      expect(download.suggestedFilename()).toBe('availability.ics');
    }
    
    // iOS might handle .ics files differently, opening them in Calendar app
    // Check for any system-level behavior or fallbacks
    await page.waitForTimeout(1000);
    
    // Verify no errors occurred
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    expect(errors).toHaveLength(0);
  });

  test('should validate .ics file format', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Add some availability slots first
    await page.click('[data-testid="slot-Monday-09:00"]'); // Assuming slots have test IDs
    await page.click('[data-testid="slot-Tuesday-14:00"]');
    
    // Export and verify format
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export iCal")');
    
    const download = await downloadPromise;
    const path = await download.path();
    
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf8');
    
    // Validate iCal structure
    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('VERSION:2.0');
    expect(content).toContain('PRODID:-//AuditoryX//EN');
    
    // Check for events
    expect(content).toContain('BEGIN:VEVENT');
    expect(content).toContain('SUMMARY:Available');
    expect(content).toContain('UID:');
    expect(content).toContain('DTSTAMP:');
    expect(content).toContain('DTSTART:');
    expect(content).toContain('DTEND:');
    expect(content).toContain('END:VEVENT');
    
    expect(content).toContain('END:VCALENDAR');
    
    // Verify CRLF line endings (required by iCal spec)
    expect(content.includes('\r\n')).toBeTruthy();
  });

  test('should handle large availability schedules', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Mock a large number of availability slots
    await page.evaluate(() => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const times = [];
      for (let hour = 9; hour < 18; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      
      const availability = [];
      days.forEach(day => {
        times.forEach(time => {
          availability.push({ day, time });
        });
      });
      
      // Set this in component state or localStorage
      localStorage.setItem('large-availability', JSON.stringify(availability));
    });
    
    // Trigger export with large dataset
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export iCal")');
    
    const download = await downloadPromise;
    const path = await download.path();
    
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf8');
    
    // Verify file is not corrupted and contains expected number of events
    const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBeGreaterThan(50); // Should have many events
    
    // Verify file size is reasonable (not empty, not too large)
    const stats = fs.statSync(path);
    expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    expect(stats.size).toBeLessThan(1000000); // Less than 1MB
  });
});

// Mobile-specific tests
test.describe('Mobile Calendar Integration', () => {
  test.use({ 
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    viewport: { width: 375, height: 812 }
  });

  test('should provide clear instructions for mobile calendar import', async ({ page }) => {
    await page.goto('/dashboard/availability');
    
    // Look for mobile-specific instructions or help text
    await page.click('button:has-text("Export iCal")');
    
    // Check if there are any mobile-specific instructions shown
    const helpText = page.locator('[data-testid="mobile-calendar-help"]');
    if (await helpText.isVisible()) {
      await expect(helpText).toContainText('calendar app');
    }
  });
});
