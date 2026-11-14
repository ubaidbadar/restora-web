const { test, expect } = require('@playwright/test');

test('a signed-in team member can open Orders and start, but not submit, a new order', async ({ page }) => {
  const email = process.env.RESTORA_E2E_EMAIL;
  const password = process.env.RESTORA_E2E_PASSWORD;
  test.skip(!email || !password, 'Configure RESTORA_E2E_EMAIL and RESTORA_E2E_PASSWORD.');

  const pageErrors = [];
  const writes = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = request.url();
    const method = request.method().toUpperCase();
    if (url.includes('/api/v1/') && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      writes.push({ method, url });
    }
  });

  await page.goto('/login?next=%2Forders', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back to Restora.')).toBeVisible();
  await page.getByLabel('Email').fill(email);
  const passwordField = page.locator('input[name="password"]');
  await expect(passwordField).toHaveCount(1);
  await passwordField.fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/orders(?:[?#].*)?$/, { timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();

  await page.goto('/orders/new', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'New order', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add customer' })).toBeVisible();

  const menuReady = page
    .getByLabel('Search menu')
    .or(page.getByText('Nothing to order yet', { exact: true }));
  await expect(menuReady).toBeVisible({ timeout: 30_000 });

  // This journey is intentionally read-only: it must never create or modify a restaurant record.
  expect(writes).toEqual([]);
  expect(pageErrors).toEqual([]);
});
