import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('displays stat cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#stat-systems')).toBeVisible();
    await expect(page.locator('#stat-high-risk')).toBeVisible();
    await expect(page.locator('#stat-open-tasks')).toBeVisible();
    await expect(page.locator('#stat-training-rate')).toBeVisible();
  });

  test('displays EU AI Act timeline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.timeline-widget')).toBeVisible();
    await expect(page.locator('.timeline-entry')).toHaveCount(4);
  });

  test('shows sources modal when clicking Sources button', async ({ page }) => {
    await page.goto('/');
    await page.click('#timeline-sources-btn');
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('EU AI Act Timeline Sources');
  });

  test('displays disclaimer banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.disclaimer-banner')).toBeVisible();
    await expect(page.locator('.disclaimer-banner')).toContainText('not constitute legal advice');
  });

  test('Add AI System button navigates to inventory', async ({ page }) => {
    await page.goto('/');
    await page.click('#dashboard-add-system');
    await expect(page.locator('h1')).toHaveText('AI Systems Inventory');
  });
});
