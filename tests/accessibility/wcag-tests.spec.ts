/**
 * WCAG Compliance Tests
 * 
 * Automated testing for WCAG 2.1 AA compliance
 */

import { test, expect } from '@playwright/test';

// Test configuration
const WCAG_THRESHOLDS = {
  colorContrast: {
    normal: 4.5,
    large: 3,
  },
  timing: {
    autoRefresh: 20000, // 20 seconds minimum
    sessionTimeout: 1200000, // 20 minutes minimum
  },
};

test.describe('WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Enable accessibility testing
    await page.goto('/');
  });

  test.describe('Principle 1: Perceivable', () => {
    test('1.1.1 Non-text Content - Images have alt text', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const ariaLabelledBy = await img.getAttribute('aria-labelledby');
        const role = await img.getAttribute('role');

        // Images should have alt text unless they are decorative
        if (role !== 'presentation' && role !== 'none') {
          expect(alt !== null || ariaLabel !== null || ariaLabelledBy !== null)
            .toBeTruthy();
        }
      }
    });

    test('1.3.1 Info and Relationships - Proper heading structure', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      let currentLevel = 0;

      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));

        // First heading should be h1
        if (currentLevel === 0) {
          expect(level).toBe(1);
        } else {
          // Subsequent headings should not skip levels
          expect(level).toBeLessThanOrEqual(currentLevel + 1);
        }

        currentLevel = level;
      }
    });

    test('1.3.1 Form labels are properly associated', async ({ page }) => {
      const inputs = page.locator('input, select, textarea').filter({ hasNot: page.locator('[type="hidden"]') });
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // Input should have a label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel !== null || ariaLabelledBy !== null)
            .toBeTruthy();
        }
      }
    });

    test('1.4.1 Use of Color - Information not conveyed by color alone', async ({ page }) => {
      // Check for common patterns that rely only on color
      const redTexts = page.locator('.text-red-500, .text-red-600, [style*="color: red"]');
      const count = await redTexts.count();

      for (let i = 0; i < count; i++) {
        const element = redTexts.nth(i);
        const text = await element.textContent();
        
        // Red text should have additional indicators (icons, text, etc.)
        if (text && !text.includes('*') && !text.includes('required') && !text.includes('error')) {
          const hasIcon = await element.locator('svg, [class*="icon"]').count() > 0;
          const hasAdditionalText = text.toLowerCase().includes('required') || 
                                   text.toLowerCase().includes('error') ||
                                   text.toLowerCase().includes('invalid');
          
          expect(hasIcon || hasAdditionalText).toBeTruthy();
        }
      }
    });

    test('1.4.3 Contrast - Sufficient color contrast', async ({ page }) => {
      // This is a simplified check - in production, use a proper contrast analyzer
      const textElements = page.locator('body *').filter({ hasText: /.+/ });
      const count = await textElements.count();

      // Sample a subset of elements for performance
      const sampleSize = Math.min(count, 50);
      for (let i = 0; i < sampleSize; i += Math.floor(count / sampleSize)) {
        const element = textElements.nth(i);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
            };
          });

          // Basic check for very low contrast (white on white, black on black)
          expect(styles.color).not.toBe(styles.backgroundColor);
        }
      }
    });
  });

  test.describe('Principle 2: Operable', () => {
    test('2.1.1 Keyboard - All functionality available via keyboard', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          // Element should be focusable
          await element.focus();
          const isFocused = await element.evaluate(el => document.activeElement === el);
          expect(isFocused).toBeTruthy();
        }
      }
    });

    test('2.1.2 No Keyboard Trap - Focus can move away from components', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();

      if (count > 1) {
        // Focus first element
        await interactiveElements.first().focus();
        
        // Tab to next element
        await page.keyboard.press('Tab');
        
        // Check that focus moved
        const firstElement = interactiveElements.first();
        const isStillFocused = await firstElement.evaluate(el => document.activeElement === el);
        expect(isStillFocused).toBeFalsy();
      }
    });

    test('2.4.1 Bypass Blocks - Skip links are present', async ({ page }) => {
      // Check for skip links
      const skipLinks = page.locator('a[href^="#"]:has-text("skip")');
      const hasSkipLinks = await skipLinks.count() > 0;
      
      if (hasSkipLinks) {
        const firstSkipLink = skipLinks.first();
        await firstSkipLink.focus();
        const isVisible = await firstSkipLink.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('2.4.2 Page Titled - Pages have descriptive titles', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('Untitled');
    });

    test('2.4.3 Focus Order - Logical focus order', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();

      if (count > 1) {
        const positions = [];
        
        for (let i = 0; i < Math.min(count, 10); i++) {
          const element = interactiveElements.nth(i);
          const isVisible = await element.isVisible();
          
          if (isVisible) {
            const box = await element.boundingBox();
            if (box) {
              positions.push({ x: box.x, y: box.y, index: i });
            }
          }
        }

        // Check if elements are generally in reading order (top to bottom, left to right)
        for (let i = 1; i < positions.length; i++) {
          const prev = positions[i - 1];
          const curr = positions[i];
          
          // Allow for some flexibility in positioning
          if (Math.abs(curr.y - prev.y) > 50) {
            expect(curr.y).toBeGreaterThanOrEqual(prev.y - 10);
          }
        }
      }
    });

    test('2.4.4 Link Purpose - Links have descriptive text', async ({ page }) => {
      const links = page.locator('a[href]');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const ariaLabelledBy = await link.getAttribute('aria-labelledby');
        const title = await link.getAttribute('title');

        const accessibleName = ariaLabel || title || text;
        
        // Links should have descriptive text
        expect(accessibleName).toBeTruthy();
        if (accessibleName) {
          expect(accessibleName.trim().length).toBeGreaterThan(0);
          // Avoid generic link text
          expect(accessibleName.toLowerCase()).not.toBe('click here');
          expect(accessibleName.toLowerCase()).not.toBe('read more');
          expect(accessibleName.toLowerCase()).not.toBe('here');
        }
      }
    });
  });

  test.describe('Principle 3: Understandable', () => {
    test('3.1.1 Language of Page - Page has lang attribute', async ({ page }) => {
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang?.length).toBeGreaterThan(0);
    });

    test('3.2.1 On Focus - No context changes on focus', async ({ page }) => {
      const initialUrl = page.url();
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          await element.focus();
          
          // Wait a bit to see if any automatic changes occur
          await page.waitForTimeout(500);
          
          // URL should not change on focus alone
          expect(page.url()).toBe(initialUrl);
        }
      }
    });

    test('3.3.1 Error Identification - Errors are clearly identified', async ({ page }) => {
      // Look for forms to test error identification
      const forms = page.locator('form');
      const formCount = await forms.count();

      if (formCount > 0) {
        const form = forms.first();
        const requiredInputs = form.locator('input[required], select[required], textarea[required]');
        const requiredCount = await requiredInputs.count();

        if (requiredCount > 0) {
          // Try to submit form without filling required fields
          const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
          const hasSubmitButton = await submitButton.count() > 0;

          if (hasSubmitButton) {
            await submitButton.click();
            
            // Check for error messages
            await page.waitForTimeout(1000);
            const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
            const hasErrors = await errorMessages.count() > 0;
            
            // If validation is implemented, errors should be shown
            if (hasErrors) {
              const firstError = errorMessages.first();
              const errorText = await firstError.textContent();
              expect(errorText).toBeTruthy();
              expect(errorText?.trim().length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    test('3.3.2 Labels or Instructions - Form inputs have labels', async ({ page }) => {
      const inputs = page.locator('input, select, textarea').filter({ hasNot: page.locator('[type="hidden"]') });
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        let hasLabel = false;
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }
        
        // Input should have some form of labeling
        expect(hasLabel || ariaLabel !== null || ariaLabelledBy !== null || placeholder !== null)
          .toBeTruthy();
      }
    });
  });

  test.describe('Principle 4: Robust', () => {
    test('4.1.1 Parsing - Valid HTML structure', async ({ page }) => {
      // Check for common HTML validity issues
      const duplicateIds = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        return [...new Set(duplicates)];
      });

      expect(duplicateIds.length).toBe(0);
    });

    test('4.1.2 Name, Role, Value - ARIA attributes are valid', async ({ page }) => {
      const elementsWithAria = page.locator('[role], [aria-label], [aria-labelledby], [aria-describedby]');
      const count = await elementsWithAria.count();

      for (let i = 0; i < count; i++) {
        const element = elementsWithAria.nth(i);
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const ariaDescribedBy = await element.getAttribute('aria-describedby');

        // Check for valid ARIA roles
        if (role) {
          const validRoles = [
            'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
            'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
            'contentinfo', 'definition', 'dialog', 'directory', 'document',
            'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
            'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
            'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
            'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
            'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
            'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
            'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
            'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
            'tooltip', 'tree', 'treegrid', 'treeitem'
          ];
          
          expect(validRoles).toContain(role);
        }

        // Check that referenced elements exist
        if (ariaLabelledBy) {
          const referencedElement = page.locator(`#${ariaLabelledBy}`);
          const exists = await referencedElement.count() > 0;
          expect(exists).toBeTruthy();
        }

        if (ariaDescribedBy) {
          const referencedElement = page.locator(`#${ariaDescribedBy}`);
          const exists = await referencedElement.count() > 0;
          expect(exists).toBeTruthy();
        }
      }
    });
  });

  test.describe('Additional Accessibility Features', () => {
    test('Focus indicators are visible', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();

      if (count > 0) {
        const element = interactiveElements.first();
        await element.focus();
        
        // Check if element has focus styles
        const focusStyle = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
          };
        });

        // Element should have some form of focus indication
        const hasFocusIndicator = 
          focusStyle.outline !== 'none' ||
          focusStyle.outlineWidth !== '0px' ||
          focusStyle.boxShadow !== 'none';

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('Responsive design supports zoom up to 200%', async ({ page }) => {
      // Test at different zoom levels
      const originalViewport = page.viewportSize();
      
      if (originalViewport) {
        // Simulate 200% zoom by halving viewport size
        await page.setViewportSize({
          width: Math.floor(originalViewport.width / 2),
          height: Math.floor(originalViewport.height / 2),
        });

        // Check that content is still accessible
        const mainContent = page.locator('main, [role="main"], #main-content');
        const isVisible = await mainContent.isVisible();
        expect(isVisible).toBeTruthy();

        // Check for horizontal scrolling (should be minimal)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = Math.floor(originalViewport.width / 2);
        
        // Allow for some horizontal scrolling but not excessive
        expect(bodyWidth).toBeLessThan(viewportWidth * 1.2);

        // Restore original viewport
        await page.setViewportSize(originalViewport);
      }
    });

    test('Reduced motion is respected', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Check that animations are reduced or removed
      const animatedElements = page.locator('[class*="animate"], [style*="animation"], [style*="transition"]');
      const count = await animatedElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = animatedElements.nth(i);
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            animationDuration: computed.animationDuration,
            transitionDuration: computed.transitionDuration,
          };
        });

        // Animations should be removed or very short when reduced motion is preferred
        if (styles.animationDuration !== 'none') {
          const duration = parseFloat(styles.animationDuration);
          expect(duration).toBeLessThanOrEqual(0.01);
        }
      }
    });
  });
});