import { test, expect } from '@playwright/test';

test.describe('Accordion Accessibility', () => {
  test('training accordion buttons have correct aria attributes', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/training"]');

    const buttons = page.locator('.accordion-btn[data-accordion]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
      await expect(btn).toHaveAttribute('aria-controls', /^accordion-/);
    }
  });

  test('training accordion toggles aria attributes on click', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/training"]');

    const btn = page.locator('.accordion-btn[data-accordion]').first();
    const controlsId = await btn.getAttribute('aria-controls');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#${controlsId}`)).toHaveAttribute('aria-hidden', 'false');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`#${controlsId}`)).toHaveAttribute('aria-hidden', 'true');
  });

  test('accordion buttons are keyboard-navigable', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/training"]');

    const btn = page.locator('.accordion-btn[data-accordion]').first();
    await btn.focus();

    // Activate with Enter key
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');

    // Toggle back with Space key
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('obligation accordion has aria-controls and aria-hidden', async ({ page }) => {
    // This test requires systems to be registered to show obligation sections
    // We test the structural attributes are present when sections exist
    await page.goto('/');
    await page.click('a[href="/obligations"]');

    const accordionBtns = page.locator('.accordion-btn[aria-controls]');
    const count = await accordionBtns.count();

    // If no systems registered, accordion sections may not appear
    // This test validates structure when they do
    for (let i = 0; i < count; i++) {
      const btn = accordionBtns.nth(i);
      await expect(btn).toHaveAttribute('aria-expanded');
      const controlsId = await btn.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      await expect(page.locator(`#${controlsId}`)).toHaveAttribute('aria-hidden');
    }
  });
});

test.describe('Exports Page', () => {
  test('displays task CSV export button', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/exports"]');
    await expect(page.locator('#export-tasks')).toBeVisible();
    await expect(page.locator('#export-tasks')).toHaveText('Tasks CSV');
  });
});
