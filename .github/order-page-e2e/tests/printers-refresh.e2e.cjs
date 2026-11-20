const { test, expect } = require('@playwright/test');

test('printer inventory refreshes without disconnecting the PC', async ({ page }) => {
  const writes = [];
  const errors = [];
  let labels = ['Existing kitchen printer'];
  let healthState = 'offline';
  const me = {
    user: { id: 'printer-test-owner', name: 'Printer Test', email: 'printer@example.test' },
    mode: 'web',
    restaurants: [{ _id: 'printer-test-restaurant', name: 'Printer Test', isOwner: true }],
    workplace: {
      restaurant: { _id: 'printer-test-restaurant', name: 'Printer Test' },
      roleNames: ['Owner'], isOwner: true, isPrimaryOwner: true, hasPin: false,
      permissions: ['devices:manage', 'orders:view'],
      branch: { _id: 'printer-test-branch', name: 'Main' }, allBranches: true,
      branches: [{ _id: 'printer-test-branch', name: 'Main' }], calls: [],
      settings: { onboarded: true, taxSet: true, whatsappTemplates: { winback: '', reservation: '' } },
    },
  };
  page.on('pageerror', error => errors.push(error.message));
  // Keep localhost consent out of this inventory test. No real agent is used.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true, value: { query: async () => ({ state: 'prompt' }) },
    });
  });
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '');
    if (request.method() !== 'GET') {
      writes.push({ method: request.method(), path });
      return route.fulfill({ status: 400, json: { message: 'Unexpected write in read-only test' } });
    }
    if (path === '/me') return route.fulfill({ json: me });
    if (path === '/orders/stream') return route.fulfill({ status: 204 });
    if (path === '/menu') return route.fulfill({ json: { categories: [], addonGroups: [], items: [] } });
    if (path === '/print-agents') return route.fulfill({ json: [{
      _id: 'printer-test-pc', name: 'Counter PC', branchId: me.workplace.branch._id,
      lastSeenAt: new Date().toISOString(), createdAt: '2026-01-01',
      printers: labels.map((label, index) => ({
        systemName: `Windows Printer ${index + 1}`, label, prints: [], categoryIds: [],
        width: 48, copies: 1, present: true,
        ...(index === 0 ? { health: { state: healthState, checkedAt: Math.floor(Date.now() / 1000), queuedJobs: 2, statusFlags: 128 } } : {}),
      })),
    }] });
    return route.fulfill({ json: [] });
  });
  await page.goto('/settings/printers');
  await expect(page.getByText('Existing kitchen printer', { exact: true })).toBeVisible();
  await expect(page.getByText('Offline reported', { exact: true })).toBeVisible();
  healthState = 'unknown';
  await expect(page.getByText('Not verified', { exact: true })).toBeVisible({ timeout: 12_000 });
  labels = [...labels, 'New receipt printer'];
  await expect(page.getByText('New receipt printer', { exact: true })).toBeVisible({ timeout: 12_000 });
  labels = [...labels, 'Manual refresh printer'];
  const refresh = page.getByRole('button', { name: 'Refresh list', exact: true });
  if (await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)) await refresh.tap();
  else await refresh.click();
  await expect(page.getByText('Manual refresh printer', { exact: true })).toBeVisible();
  expect(writes).toEqual([]);
  expect(errors).toEqual([]);
});
