import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('loads the dashboard page by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('navigates to inventory page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/inventory"]');
    await expect(page.locator('h1')).toHaveText('AI Systems Inventory');
  });

  test('navigates to risk page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/risk"]');
    await expect(page.locator('h1')).toHaveText('Risk Classification');
  });

  test('navigates to obligations page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/obligations"]');
    await expect(page.locator('h1')).toHaveText('Obligations');
  });

  test('navigates to training page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/training"]');
    await expect(page.locator('h1')).toHaveText('Training');
  });

  test('navigates to tasks page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/tasks"]');
    await expect(page.locator('h1')).toHaveText('Task Board');
  });

  test('navigates to exports page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/exports"]');
    await expect(page.locator('h1')).toHaveText('Exports');
  });

  test('navigates to settings page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/settings"]');
    await expect(page.locator('h1')).toHaveText('Settings');
  });
});
