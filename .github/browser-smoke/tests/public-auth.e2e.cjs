const { test, expect } = require('@playwright/test');

test('live unauthenticated pages render and navigate without a browser crash', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('live PWA can reload a visited sign-in screen offline', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();

  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker?.getRegistration();
    return registration?.active?.state === 'activated';
  }, undefined, { timeout: 25_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();
  expect(errors).toEqual([]);
});
