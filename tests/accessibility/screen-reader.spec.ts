/**
 * Screen Reader Compatibility Tests
 * 
 * Tests to ensure compatibility with screen readers and assistive technologies
 */

import { test, expect } from '@playwright/test';

test.describe('Screen Reader Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Semantic Structure', () => {
    test('Page has proper landmark structure', async ({ page }) => {
      // Check for main landmarks
      const landmarks = {
        banner: page.locator('[role="banner"], header'),
        navigation: page.locator('[role="navigation"], nav'),
        main: page.locator('[role="main"], main'),
        contentinfo: page.locator('[role="contentinfo"], footer'),
        complementary: page.locator('[role="complementary"], aside'),
      };

      // Banner/header should exist
      const bannerCount = await landmarks.banner.count();
      expect(bannerCount).toBeGreaterThan(0);

      // Main content should exist
      const mainCount = await landmarks.main.count();
      expect(mainCount).toBeGreaterThan(0);

      // Footer should exist
      const footerCount = await landmarks.contentinfo.count();
      expect(footerCount).toBeGreaterThan(0);

      // Navigation should exist
      const navCount = await landmarks.navigation.count();
      expect(navCount).toBeGreaterThan(0);
    });

    test('Headings provide proper document outline', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6, [role="heading"]').all();
      
      expect(headings.length).toBeGreaterThan(0);

      // Should have exactly one h1
      const h1Count = await page.locator('h1, [role="heading"][aria-level="1"]').count();
      expect(h1Count).toBe(1);

      // Check heading hierarchy
      let previousLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const ariaLevel = await heading.getAttribute('aria-level');
        
        let level: number;
        if (ariaLevel) {
          level = parseInt(ariaLevel);
        } else if (tagName.startsWith('h')) {
          level = parseInt(tagName.charAt(1));
        } else {
          continue;
        }

        if (previousLevel === 0) {
          expect(level).toBe(1);
        } else {
          // Should not skip more than one level
          expect(level).toBeLessThanOrEqual(previousLevel + 1);
        }

        previousLevel = level;
      }
    });

    test('Lists are properly structured', async ({ page }) => {
      const lists = page.locator('ul, ol, [role="list"]');
      const listCount = await lists.count();

      for (let i = 0; i < listCount; i++) {
        const list = lists.nth(i);
        const listItems = list.locator('li, [role="listitem"]');
        const itemCount = await listItems.count();

        // Lists should have list items
        expect(itemCount).toBeGreaterThan(0);

        // Check that list items are properly nested
        for (let j = 0; j < itemCount; j++) {
          const item = listItems.nth(j);
          const role = await item.getAttribute('role');
          const tagName = await item.evaluate(el => el.tagName.toLowerCase());
          
          expect(tagName === 'li' || role === 'listitem').toBeTruthy();
        }
      }
    });
  });

  test.describe('ARIA Labels and Descriptions', () => {
    test('Interactive elements have accessible names', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [role="button"], [role="link"]');
      const count = await interactiveElements.count();

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          const accessibleName = await element.evaluate(el => {
            // Calculate accessible name according to accessibility specification
            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel) return ariaLabel.trim();

            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            if (ariaLabelledBy) {
              const labelElement = document.getElementById(ariaLabelledBy);
              if (labelElement) return labelElement.textContent?.trim();
            }

            const id = el.getAttribute('id');
            if (id) {
              const label = document.querySelector(`label[for="${id}"]`);
              if (label) return label.textContent?.trim();
            }

            const title = el.getAttribute('title');
            if (title) return title.trim();

            return el.textContent?.trim();
          });

          expect(accessibleName).toBeTruthy();
          expect(accessibleName?.length).toBeGreaterThan(0);
        }
      }
    });

    test('Form inputs have proper labels and descriptions', async ({ page }) => {
      const formInputs = page.locator('input, select, textarea').filter({ hasNot: page.locator('[type="hidden"]') });
      const count = await formInputs.count();

      for (let i = 0; i < count; i++) {
        const input = formInputs.nth(i);
        const isVisible = await input.isVisible();
        
        if (isVisible) {
          const labelInfo = await input.evaluate(el => {
            const id = el.getAttribute('id');
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const ariaDescribedBy = el.getAttribute('aria-describedby');
            
            let hasLabel = false;
            let hasDescription = false;
            
            if (ariaLabel) hasLabel = true;
            
            if (id) {
              const label = document.querySelector(`label[for="${id}"]`);
              if (label) hasLabel = true;
            }
            
            if (ariaLabelledBy) {
              const labelElement = document.getElementById(ariaLabelledBy);
              if (labelElement) hasLabel = true;
            }
            
            if (ariaDescribedBy) {
              const descElement = document.getElementById(ariaDescribedBy);
              if (descElement) hasDescription = true;
            }
            
            return { hasLabel, hasDescription };
          });

          expect(labelInfo.hasLabel).toBeTruthy();
        }
      }
    });

    test('Images have appropriate alternative text', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const isVisible = await img.isVisible();
        
        if (isVisible) {
          const imageInfo = await img.evaluate(el => {
            const alt = el.getAttribute('alt');
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const role = el.getAttribute('role');
            const src = el.getAttribute('src');
            
            return { alt, ariaLabel, ariaLabelledBy, role, src };
          });

          // Decorative images should have empty alt or presentation role
          if (imageInfo.role === 'presentation' || imageInfo.role === 'none') {
            expect(imageInfo.alt === '' || imageInfo.alt === null).toBeTruthy();
          } else {
            // Informative images should have meaningful alt text
            const hasAltText = imageInfo.alt !== null || 
                              imageInfo.ariaLabel !== null || 
                              imageInfo.ariaLabelledBy !== null;
            expect(hasAltText).toBeTruthy();
            
            if (imageInfo.alt) {
              // Alt text should not be redundant
              expect(imageInfo.alt.toLowerCase()).not.toContain('image of');
              expect(imageInfo.alt.toLowerCase()).not.toContain('picture of');
              expect(imageInfo.alt.toLowerCase()).not.toContain('photo of');
            }
          }
        }
      }
    });
  });

  test.describe('Live Regions and Dynamic Content', () => {
    test('Live regions are properly configured', async ({ page }) => {
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"], [role="log"], [role="marquee"]');
      const count = await liveRegions.count();

      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');
        
        // Check for valid live region configurations
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
        
        if (role) {
          expect(['status', 'alert', 'log', 'marquee']).toContain(role);
        }
      }
    });

    test('Error messages are announced', async ({ page }) => {
      // Look for forms to test error announcements
      const forms = page.locator('form');
      const formCount = await forms.count();

      if (formCount > 0) {
        const form = forms.first();
        const emailInput = form.locator('input[type="email"], input[name*="email"]').first();
        const hasEmailInput = await emailInput.count() > 0;

        if (hasEmailInput) {
          // Enter invalid email
          await emailInput.fill('invalid-email');
          await emailInput.blur();
          
          // Wait for potential validation
          await page.waitForTimeout(1000);
          
          // Check for error message with proper ARIA
          const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]').filter({ hasText: /error|invalid|required/i });
          const hasErrorMessage = await errorMessage.count() > 0;
          
          if (hasErrorMessage) {
            const errorText = await errorMessage.first().textContent();
            expect(errorText).toBeTruthy();
            expect(errorText?.trim().length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('Loading states are announced', async ({ page }) => {
      // Look for buttons that might trigger loading states
      const submitButtons = page.locator('button[type="submit"], button:has-text("submit"), button:has-text("save"), button:has-text("send")');
      const buttonCount = await submitButtons.count();

      if (buttonCount > 0) {
        const button = submitButtons.first();
        
        // Click button and check for loading announcement
        await button.click();
        
        // Check for loading indicator with proper ARIA
        const loadingIndicator = page.locator('[aria-busy="true"], [role="status"]:has-text("loading"), [aria-live]:has-text("loading")');
        const hasLoadingIndicator = await loadingIndicator.count() > 0;
        
        if (hasLoadingIndicator) {
          const loadingText = await loadingIndicator.first().textContent();
          expect(loadingText?.toLowerCase()).toContain('loading');
        }
      }
    });
  });

  test.describe('Navigation and Focus Management', () => {
    test('Focus is properly managed in modals', async ({ page }) => {
      // Look for modal triggers
      const modalTriggers = page.locator('button:has-text("modal"), button:has-text("dialog"), [data-modal], [aria-haspopup="dialog"]');
      const triggerCount = await modalTriggers.count();

      if (triggerCount > 0) {
        const trigger = modalTriggers.first();
        await trigger.click();
        
        // Wait for modal to appear
        await page.waitForTimeout(500);
        
        // Check for modal with proper ARIA
        const modal = page.locator('[role="dialog"], [role="alertdialog"], .modal[aria-modal="true"]');
        const modalCount = await modal.count();
        
        if (modalCount > 0) {
          const modalElement = modal.first();
          
          // Modal should be properly labeled
          const ariaLabel = await modalElement.getAttribute('aria-label');
          const ariaLabelledBy = await modalElement.getAttribute('aria-labelledby');
          expect(ariaLabel !== null || ariaLabelledBy !== null).toBeTruthy();
          
          // Focus should be within modal
          const focusedElement = page.locator(':focus');
          const focusWithinModal = modalElement.locator(':focus');
          const isFocusInModal = await focusWithinModal.count() > 0;
          
          if (await focusedElement.count() > 0) {
            expect(isFocusInModal).toBeTruthy();
          }
          
          // Should have close button
          const closeButton = modalElement.locator('button:has-text("close"), button[aria-label*="close"], [role="button"][aria-label*="close"]');
          const hasCloseButton = await closeButton.count() > 0;
          expect(hasCloseButton).toBeTruthy();
        }
      }
    });

    test('Tables have proper headers and navigation', async ({ page }) => {
      const tables = page.locator('table, [role="table"]');
      const tableCount = await tables.count();

      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        
        // Check for table headers
        const headers = table.locator('th, [role="columnheader"], [role="rowheader"]');
        const headerCount = await headers.count();
        
        if (headerCount > 0) {
          // Headers should have proper scope or role
          for (let j = 0; j < headerCount; j++) {
            const header = headers.nth(j);
            const scope = await header.getAttribute('scope');
            const role = await header.getAttribute('role');
            const tagName = await header.evaluate(el => el.tagName.toLowerCase());
            
            const isProperHeader = tagName === 'th' || 
                                  role === 'columnheader' || 
                                  role === 'rowheader' ||
                                  scope !== null;
            
            expect(isProperHeader).toBeTruthy();
          }
        }
        
        // Check for table caption or aria-label
        const caption = table.locator('caption');
        const ariaLabel = await table.getAttribute('aria-label');
        const ariaLabelledBy = await table.getAttribute('aria-labelledby');
        const hasAccessibleName = await caption.count() > 0 || 
                                 ariaLabel !== null || 
                                 ariaLabelledBy !== null;
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('All interactive elements are keyboard accessible', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]');
      const count = await interactiveElements.count();

      // Test keyboard navigation on a sample of elements
      const sampleSize = Math.min(count, 10);
      for (let i = 0; i < sampleSize; i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          // Element should be focusable
          await element.focus();
          const isFocused = await element.evaluate(el => document.activeElement === el);
          expect(isFocused).toBeTruthy();
          
          // Should respond to Enter key
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          const role = await element.getAttribute('role');
          
          if (tagName === 'button' || role === 'button') {
            // Buttons should be activatable with Enter and Space
            const isDisabled = await element.isDisabled();
            if (!isDisabled) {
              // Test Enter key (Space key testing would require more complex setup)
              await element.press('Enter');
              // Just verify the key press doesn't cause errors
            }
          }
        }
      }
    });

    test('Skip links work correctly', async ({ page }) => {
      // Focus on document body first
      await page.keyboard.press('Tab');
      
      // Look for skip links
      const skipLinks = page.locator('a[href^="#"]:has-text("skip")');
      const skipLinkCount = await skipLinks.count();
      
      if (skipLinkCount > 0) {
        const firstSkipLink = skipLinks.first();
        await firstSkipLink.focus();
        
        // Skip link should be visible when focused
        const isVisible = await firstSkipLink.isVisible();
        expect(isVisible).toBeTruthy();
        
        // Activate skip link
        await firstSkipLink.press('Enter');
        
        // Focus should move to target
        const href = await firstSkipLink.getAttribute('href');
        if (href) {
          const targetId = href.substring(1);
          const targetElement = page.locator(`#${targetId}`);
          const targetExists = await targetElement.count() > 0;
          
          if (targetExists) {
            // Check if focus moved to target or near it
            await page.waitForTimeout(100);
            const focusedElement = page.locator(':focus');
            const focusedCount = await focusedElement.count();
            expect(focusedCount).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Content Structure for Screen Readers', () => {
    test('Content has logical reading order', async ({ page }) => {
      // Get all visible text content in tab order
      const textElements = await page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          node => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            
            const text = node.textContent?.trim();
            if (!text || text.length === 0) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          const rect = node.parentElement?.getBoundingClientRect();
          if (rect && rect.width > 0 && rect.height > 0) {
            textNodes.push({
              text: node.textContent?.trim(),
              y: rect.top,
              x: rect.left,
            });
          }
        }
        
        return textNodes;
      });

      // Content should generally flow from top to bottom
      expect(textElements.length).toBeGreaterThan(0);
      
      for (let i = 1; i < Math.min(textElements.length, 20); i++) {
        const prev = textElements[i - 1];
        const curr = textElements[i];
        
        // Allow for some flexibility in positioning
        if (Math.abs(curr.y - prev.y) > 10) {
          expect(curr.y).toBeGreaterThanOrEqual(prev.y - 5);
        }
      }
    });

    test('Form groups are properly structured', async ({ page }) => {
      const fieldsets = page.locator('fieldset');
      const fieldsetCount = await fieldsets.count();

      for (let i = 0; i < fieldsetCount; i++) {
        const fieldset = fieldsets.nth(i);
        
        // Fieldset should have legend
        const legend = fieldset.locator('legend').first();
        const hasLegend = await legend.count() > 0;
        
        if (hasLegend) {
          const legendText = await legend.textContent();
          expect(legendText?.trim().length).toBeGreaterThan(0);
        }
        
        // Fieldset should contain form controls
        const formControls = fieldset.locator('input, select, textarea, button');
        const controlCount = await formControls.count();
        expect(controlCount).toBeGreaterThan(0);
      }
    });
  });
});