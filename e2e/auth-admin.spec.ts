import { test, expect } from '@playwright/test';

const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

test('sign in and access admin dashboard', async ({ page }) => {
  await page.goto('/signin');
  await page.getByPlaceholder('Email').fill('admin@example.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Enter 2FA code').waitFor();
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForURL(/\//);
  await page.goto('/admin');
  await expect(page.getByText('Admin Dashboard')).toBeVisible();
});

test('create watchlist', async ({ page }) => {
  await page.goto('/signin');
  await page.getByPlaceholder('Email').fill('demo@example.com');
  await page.getByPlaceholder('Password').fill('demo');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Enter 2FA code').waitFor();
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.goto('/watchlists');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Created:')).toBeVisible();
});
