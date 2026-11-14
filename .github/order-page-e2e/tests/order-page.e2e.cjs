const { test: base, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const CATEGORY_NAMES = [
  'Karahi', 'Biryani', 'BBQ', 'Burgers', 'Pizza', 'Desserts', 'Drinks',
  'Breakfast', 'Sandwiches', 'Platters', 'Traditional favourites', 'Specials',
  'Hot drinks', 'Cold drinks',
];
const CATEGORIES = CATEGORY_NAMES.map((name, index) => ({
  _id: 'category-' + (index + 1),
  name,
  sortOrder: index,
}));

const MENU_ITEMS = Array.from({ length: 20 }, (_, index) => {
  const isBiryani = index === 1;
  return {
    _id: 'dish-' + (index + 1),
    categoryId: CATEGORIES[index % CATEGORIES.length]._id,
    name: index === 0 ? 'Chicken Karahi' : isBiryani ? 'Biryani' : 'Dish ' + (index + 1),
    sizes: isBiryani
      ? [
          { _id: 'biryani-half', name: 'Half', price: 300 },
          { _id: 'biryani-full', name: 'Full', price: 550 },
        ]
      : [{ _id: 'size-' + (index + 1), name: '', price: 1000 + index * 50 }],
    addonGroupIds: isBiryani ? ['raita-group'] : [],
    includes: [],
    days: [],
    from: '',
    to: '',
    soldOut: false,
    hidden: false,
  };
});

const MENU = {
  categories: CATEGORIES,
  addonGroups: [{
    _id: 'raita-group',
    name: 'Raita',
    min: 0,
    max: 1,
    options: [{ _id: 'raita', name: 'Raita', price: 50 }],
  }],
  items: MENU_ITEMS,
};

const CUSTOMERS = [
  {
    _id: 'customer-ali',
    name: 'Ali Raza',
    phone: '+923001234567',
    tags: [],
    khataBalance: 500,
    orderCount: 3,
    totalSpent: 3000,
    createdAt: '2026-01-01',
    addresses: ['House 17, Street 4'],
    area: 'Gulberg',
  },
  {
    _id: 'customer-sara',
    name: 'Sara Khan',
    phone: '+923009876543',
    tags: [],
    khataBalance: 0,
    orderCount: 2,
    totalSpent: 1800,
    createdAt: '2026-01-02',
    addresses: ['Shop 8, Main Road'],
    area: 'Model Town',
  },
];

const ME = {
  user: { id: 'e2e-owner', name: 'Browser Test Owner', email: 'owner@example.test' },
  mode: 'web',
  restaurants: [{ _id: 'restaurant-e2e', name: 'Restora Browser Test', isOwner: true }],
  workplace: {
    restaurant: { _id: 'restaurant-e2e', name: 'Restora Browser Test' },
    roleNames: ['Owner'],
    isOwner: true,
    isPrimaryOwner: true,
    hasPin: false,
    permissions: [
      'orders:view', 'orders:create', 'orders:update', 'orders:payment', 'orders:discount',
      'tables:view', 'customers:view', 'customers:manage', 'menu:view', 'devices:manage',
    ],
    branch: { _id: 'branch-e2e', name: 'Main' },
    allBranches: true,
    branches: [{ _id: 'branch-e2e', name: 'Main' }],
    calls: [],
    settings: {
      onboarded: true,
      taxSet: true,
      taxByPaymentMethod: { cash: 15, card: 5, jazzcash: 5, easypaisa: 5, bank: 5 },
      whatsappTemplates: { winback: '', reservation: '' },
    },
  },
};

async function addDish(page, name) {
  const quickAdd = page.getByRole('button', { name: 'Add ' + name, exact: true });
  if (await quickAdd.count()) {
    await quickAdd.click();
    return;
  }
  await page.getByRole('button').filter({ hasText: name }).first().click();
}

async function openCheckout(page) {
  const desktopCheckout = page.getByRole('complementary', { name: 'Checkout' });
  if (await desktopCheckout.count() && await desktopCheckout.isVisible()) return desktopCheckout;
  await page.getByRole('button', { name: 'View order' }).click();
  const sheet = page.getByRole('dialog', { name: 'Order' });
  await expect(sheet).toBeVisible();
  return sheet;
}

const test = base.extend({
  app: async ({ page }, use) => {
    const pageErrors = [];
    const writes = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/^\/api\/v1/, '') || '/';
      const method = request.method();

      // The live order stream is intentionally disabled; every REST response is deterministic and isolated.
      if (path === '/orders/stream') return route.abort();

      if (method === 'GET') {
        if (path === '/me') return route.fulfill({ json: ME });
        if (path === '/menu') return route.fulfill({ json: MENU });
        if (path === '/tables') return route.fulfill({ json: [] });
        if (path === '/orders' || path === '/tables/floor' || path === '/whatsapp/conversations') {
          return route.fulfill({ json: [] });
        }
        if (path === '/customers') {
          const query = (url.searchParams.get('q') || '').toLowerCase();
          const rows = query
            ? CUSTOMERS.filter((customer) => customer.name.toLowerCase().includes(query) || customer.phone.includes(query))
            : CUSTOMERS;
          return route.fulfill({ json: rows });
        }
        const customerId = path.match(/^\/customers\/([^/]+)$/)?.[1];
        if (customerId) {
          return route.fulfill({ json: CUSTOMERS.find((customer) => customer._id === customerId) || null });
        }
        return route.fulfill({ json: [] });
      }

      let body;
      try {
        body = request.postDataJSON();
      } catch {
        body = undefined;
      }
      writes.push({ method, path, body });

      if (method === 'POST' && path === '/orders') {
        // Slow the response slightly so the submit pending/duplicate-click guard is exercised.
        await new Promise((resolve) => setTimeout(resolve, 300));
        return route.fulfill({ json: { _id: 'order-e2e', dailyToken: 101, ...body } });
      }
      if (method === 'POST' && path === '/customers') {
        return route.fulfill({
          json: {
            ...body,
            _id: 'customer-new',
            tags: [],
            khataBalance: 0,
            orderCount: 0,
            totalSpent: 0,
            createdAt: '2026-01-03',
          },
        });
      }
      return route.fulfill({ json: { success: true } });
    });

    await page.goto('/orders/new');
    await expect(page.getByRole('heading', { name: 'New order', exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Dishes' })).toBeVisible();

    await use({ page, pageErrors, writes });
    expect(pageErrors).toEqual([]);
  },
});

test('responsive layout has no page overflow and category navigation matches the input device', async ({ app }, testInfo) => {
  const { page } = app;
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);

  const rail = page.getByRole('group', { name: 'Category' }).locator('div.flex.gap-2').first();
  const metrics = await rail.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      flexWrap: style.flexWrap,
      overflowX: style.overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });

  if (testInfo.project.name.includes('desktop') || testInfo.project.name.includes('laptop') || testInfo.project.name.includes('lg-drawer')) {
    expect(metrics.flexWrap).toBe('wrap');
    expect(metrics.overflowX).toBe('visible');
  } else {
    expect(metrics.flexWrap).toBe('nowrap');
    expect(metrics.overflowX).toBe('auto');
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await rail.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    expect(await rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  }

  await page.screenshot({ path: testInfo.outputPath('new-order-initial.png'), fullPage: true });
});

test('slash focuses menu search and typing filters dishes', async ({ app }) => {
  const { page } = app;
  await page.keyboard.press('/');
  const search = page.getByLabel('Search menu');
  await expect(search).toBeFocused();
  await search.fill('Biryani');
  await expect(page.getByRole('button').filter({ hasText: 'Biryani' }).first()).toBeVisible();
  await expect(page.getByRole('button').filter({ hasText: 'Chicken Karahi' })).toHaveCount(0);
});

test('size and add-on picker calculates the selected dish price', async ({ app }) => {
  const { page } = app;
  await page.getByRole('button').filter({ hasText: 'Biryani' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Biryani' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('radio', { name: 'Full · Rs 550' }).click();
  await dialog.getByRole('button', { name: /Raita/ }).click();
  await dialog.getByRole('button', { name: 'Add · Rs 600' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Rs 600').first()).toBeVisible();
});

test('quantity changes update the order line and checkout total', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const plus = page.getByRole('button', { name: 'One more Chicken Karahi' });
  if (await plus.count()) {
    await plus.click();
  } else {
    await addDish(page, 'Chicken Karahi');
  }
  const checkout = await openCheckout(page);
  await expect(checkout.getByText('Rs 2,000').first()).toBeVisible();
});

test('customer picker is a separate searchable modal and selection collapses to the name', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await checkout.getByRole('button', { name: 'Add customer' }).click();

  const customerDialog = page.getByRole('dialog', { name: 'Select customer' });
  await expect(customerDialog).toBeVisible();
  await customerDialog.getByRole('combobox', { name: 'Find customer by phone number or name' }).fill('ali');
  await customerDialog.getByRole('option', { name: /Ali Raza/ }).click();
  await expect(checkout.getByRole('button', { name: 'Remove Ali Raza' })).toBeVisible();
  await expect(customerDialog).toHaveCount(0);
});

test('dine-in and pay-later are the defaults; service charge is immediately available', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await expect(checkout.getByRole('radio', { name: 'Dine-in' })).toBeChecked();
  await expect(checkout.getByRole('radio', { name: 'Pay later' })).toBeChecked();
  await expect(checkout.getByLabel('Charge type')).toHaveValue('percentage');
  await expect(checkout.getByRole('button', { name: 'Add service charge' })).toHaveCount(0);
  await checkout.getByLabel('Percentage (%)').fill('10');
  await expect(checkout.getByText('Service charge (10%)')).toBeVisible();
  await expect(checkout.getByText('Rs 1,100')).toBeVisible();
});

test('fixed service charge and payment-method tax recalculate without stale values', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await checkout.getByLabel('Charge type').selectOption('fixed');
  await checkout.getByLabel('Amount (Rs)').fill('75');
  await expect(checkout.getByText('Service charge', { exact: true })).toBeVisible();
  await expect(checkout.getByText('Rs 1,075')).toBeVisible();

  await checkout.getByRole('radio', { name: 'Paid now' }).click();
  await checkout.getByRole('radio', { name: 'Cash' }).click();
  await expect(checkout.getByText('Tax (15%)')).toBeVisible();
  await expect(checkout.getByText('Rs 1,225')).toBeVisible();
});

test('changing order type removes stale table and delivery-only fields from the submitted payload', async ({ app }) => {
  const { page, writes } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);

  await checkout.getByLabel('Table').fill('Table 8');
  await checkout.getByRole('radio', { name: 'Delivery' }).click();
  await expect(checkout.getByRole('region', { name: 'Service charge' })).toHaveCount(0);
  await expect(checkout.getByLabel('Delivery fee (Rs)')).toBeVisible();
  await checkout.getByLabel('Complete address').fill('House 5, Main Road');
  await checkout.getByLabel('Rider').fill('Ahmed');
  await checkout.getByLabel('Delivery fee (Rs)').fill('150');
  await checkout.getByRole('radio', { name: 'Takeaway' }).click();
  await expect(checkout.getByRole('region', { name: 'Service charge' })).toHaveCount(0);
  await expect(checkout.getByLabel('Delivery fee (Rs)')).toHaveCount(0);

  await checkout.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/\/orders$/);
  const orderWrite = writes.find((write) => write.method === 'POST' && write.path === '/orders');
  expect(orderWrite).toBeTruthy();
  expect(orderWrite.body).toMatchObject({ type: 'takeaway', deliveryFee: 0 });
  expect(orderWrite.body.tableId).toBeUndefined();
  expect(orderWrite.body.tableName).toBeUndefined();
  expect(orderWrite.body.area).toBeUndefined();
  expect(orderWrite.body.address).toBeUndefined();
  expect(orderWrite.body.rider).toBeUndefined();
});

test('dine-in cannot be submitted until a table is selected', async ({ app }) => {
  const { page, writes } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await checkout.getByRole('button', { name: 'Place order' }).click();
  await expect(checkout.getByText('Enter the table')).toBeVisible();
  expect(writes.filter((write) => write.method === 'POST' && write.path === '/orders')).toHaveLength(0);
});

test('rapid double activation cannot create duplicate orders', async ({ app }, testInfo) => {
  const { page, writes } = app;
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await checkout.getByRole('radio', { name: 'Takeaway' }).click();
  const place = checkout.getByRole('button', { name: 'Place order' });
  await place.dblclick({ timeout: 5_000 }).catch(() => {});
  await expect(page).toHaveURL(/\/orders$/, { timeout: 15_000 });
  expect(writes.filter((write) => write.method === 'POST' && write.path === '/orders')).toHaveLength(1);
});

test('long carts keep the order list scrollable and the place-order action reachable', async ({ app }, testInfo) => {
  const { page } = app;
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));

  for (let index = 3; index <= 14; index += 1) {
    await addDish(page, 'Dish ' + index);
  }

  const checkout = await openCheckout(page);
  const lines = page.getByRole('list', { name: 'Items in this order' });
  await expect(lines).toBeVisible();
  await lines.evaluate((element) => {
    const scrollable = element.parentElement;
    if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
  });
  await expect(checkout.getByRole('button', { name: 'Place order' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('new-order-long-cart.png'), fullPage: true });
});

test('core order page has no serious WCAG 2.2 A/AA axe violations', async ({ app }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));
  const { page } = app;
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter((violation) =>
    violation.impact === 'critical' || violation.impact === 'serious'
  );
  expect(serious.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))).toEqual([]);
});
