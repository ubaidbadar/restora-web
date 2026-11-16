const { test, expect } = require('@playwright/test');

test('a signed-in team member can open Orders and start, but not submit, a new order', async ({ page }) => {
  const email = process.env.RESTORA_E2E_EMAIL;
  const password = process.env.RESTORA_E2E_PASSWORD;
  test.skip(!email || !password, 'Configure RESTORA_E2E_EMAIL and RESTORA_E2E_PASSWORD.');

  const pageErrors = [];
  const writes = [];
  const meStatuses = [];
  let signInRequests = 0;
  let signInRequestFailures = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/auth/sign-in/email' && request.method() === 'POST') {
      signInRequests += 1;
    }
  });
  page.on('requestfailed', (request) => {
    if (new URL(request.url()).pathname === '/api/auth/sign-in/email' && request.method() === 'POST') {
      signInRequestFailures += 1;
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (new URL(response.url()).pathname === '/api/v1/me') meStatuses.push(response.status());
  });
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
  // Fail with a precise HTTP status instead of timing out on the login page for all three devices.
  // Never log credentials, auth response bodies, cookies or tokens.
  const signInResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/auth/sign-in/email'
      && response.request().method() === 'POST',
    { timeout: 12_000 },
  ).catch(() => null);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const response = await signInResponse;
  if (!response) {
    const invalidFields = await page.locator('form input[aria-invalid="true"]').count();
    throw new Error(`No sign-in response. Requests: ${signInRequests}; network failures: ${signInRequestFailures}; invalid form fields: ${invalidFields}. Check test-account email format, form validation and dev API connectivity.`);
  }
  if (!response.ok()) {
    throw new Error(`Dedicated E2E sign-in failed with HTTP ${response.status()}. Check the configured test account and matching dev API.`);
  }

  try {
    await expect(page).toHaveURL(/\/orders(?:[?#].*)?$/, { timeout: 20_000 });
  } catch {
    // The credentials were accepted but the app never entered Orders. Report session status,
    // not the response body, cookies or any account information.
    const location = new URL(page.url());
    throw new Error(`Sign-in returned HTTP ${response.status()}, but the app stayed at ${location.pathname}. /me HTTP statuses: ${meStatuses.join(', ') || 'none'}. Check session cookies and the dev API origin.`);
  }
  await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();

  await page.goto('/orders/new', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'New order', exact: true })).toBeVisible();
  const menuReady = page
    .getByLabel('Search menu')
    .or(page.getByText('Nothing to order yet', { exact: true }));
  await expect(menuReady).toBeVisible({ timeout: 30_000 });

  // This journey is intentionally read-only: it must never create or modify a restaurant record.
  expect(writes).toEqual([]);
  expect(pageErrors).toEqual([]);
});
