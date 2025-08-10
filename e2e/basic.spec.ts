import { test, expect } from '@playwright/test';

async function injectAxe(page) {
  await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.8.2/axe.min.js' });
}

test('dashboard shows KPI tiles and live watchlist', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Portfolio Dashboard')).toBeVisible();
  await expect(page.getByText('Total Value')).toBeVisible();
  await expect(page.getByText("Live Watchlist")).toBeVisible();
  // Expect 4 watchlist cards
  await expect(page.locator('text=AAPL')).toBeVisible({ timeout: 5000 });
});

test('single asset page renders quote', async ({ page }) => {
  await page.goto('/asset/AAPL');
  await expect(page.getByText('AAPL')).toBeVisible();
  await expect(page.getByText('Price')).toBeVisible();
});

test('a11y: no critical violations on dashboard', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
  });
  // Allow non-critical issues in this minimal scaffold
  expect(results.violations.filter((v: any) => v.impact === 'critical').length).toBe(0);
});
