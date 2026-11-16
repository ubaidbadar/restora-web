const { test: base, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const CATEGORY_NAMES = [
  'Pizza', 'Burgers', 'Hot Wings', 'Shawarma', 'Pasta', 'Karahi',
  'Beef Karahi', 'Mutton Karahi', 'BBQ', 'Fish', 'Tandoori', 'Desi Kahanay',
  'Rice', 'Drink Bar', "Ice Cream's", "Shake's", 'Extra Topping', "Side Order's",
  "Frie's", 'Appetizer', 'Salad Bar', 'Deals', 'KFG SPC.', 'Service Charges',
];
const CATEGORIES = CATEGORY_NAMES.map((name, index) => ({
  _id: 'category-' + (index + 1),
  name,
  sortOrder: index,
}));

const MENU_ITEMS = Array.from({ length: 72 }, (_, index) => {
  const isBiryani = index === 1;
  return {
    _id: 'dish-' + (index + 1),
    categoryId: CATEGORIES[index === 0 ? 5 : index === 1 ? 12 : index % CATEGORIES.length]._id,
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

const TABLES = Array.from({ length: 10 }, (_, index) => ({
  _id: 'table-' + (index + 1),
  name: 'T' + (index + 1),
  section: 'Main',
  seats: index % 2 === 0 ? 4 : 2,
  archived: false,
}));

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
      'orders:view', 'orders:create', 'orders:update', 'orders:payment', 'orders:discount', 'orders:cancel',
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

async function activate(page, locator) {
  // Use a real touch gesture on coarse-pointer devices; mouse clicks can hide mobile tap regressions.
  const touch = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  if (touch) await locator.tap();
  else await locator.click();
}

async function addDish(page, name) {
  const quickAdd = page.getByRole('button', { name: 'Add ' + name, exact: true });
  if (await quickAdd.count()) {
    await activate(page, quickAdd);
    return;
  }
  const dishButton = page.getByRole('button', { name: new RegExp('^' + name + '(?:\\s|$)') }).first();
  await activate(page, dishButton);
}

async function chooseRadio(page, scope, name) {
  // Activate the visible label, not the clipped sr-only radio input.
  await activate(page, scope.getByText(name, { exact: true }));
}

async function openCheckout(page) {
  const desktopCheckout = page.getByRole('complementary', { name: 'Checkout' });
  if (await desktopCheckout.count() && await desktopCheckout.isVisible()) return desktopCheckout;
  await activate(page, page.getByRole('button', { name: 'View order' }));
  const sheet = page.getByRole('dialog', { name: 'Order' });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function createOrderAndShowList(page) {
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await chooseRadio(page, checkout, 'Takeaway');
  await activate(page, checkout.getByRole('button', { name: 'Place order' }));
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();

  await activate(page, page.getByRole('button', { name: 'Filter' }));
  const filter = page.getByRole('dialog', { name: 'Filter orders' });
  await activate(page, filter.getByText('List', { exact: true }));
  await activate(page, filter.getByRole('button', { name: 'Show orders' }));
  await expect(page.getByRole('list', { name: 'Orders' })).toBeVisible();
}

const test = base.extend({
  app: async ({ page }, use) => {
    const pageErrors = [];
    const writes = [];
    const orders = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/^\/api\/v1/, '') || '/';
      const method = request.method();

      // The live order stream is intentionally disabled; every REST response is deterministic and isolated.
      if (path === '/orders/stream') return route.fulfill({ status: 204 });

      if (method === 'GET') {
        if (path === '/me') return route.fulfill({ json: ME });
        if (path === '/menu') return route.fulfill({ json: MENU });
        if (path === '/tables') return route.fulfill({ json: TABLES });
        if (path === '/orders') return route.fulfill({ json: orders });
        if (path === '/tables/floor' || path === '/whatsapp/conversations') {
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
        const items = body.items.map((item) => {
          const menuItem = MENU_ITEMS.find((candidate) => candidate._id === item.itemId);
          const size = menuItem?.sizes.find((candidate) => candidate._id === item.sizeId) ?? menuItem?.sizes[0];
          const addons = (item.addonIds ?? []).map((id) => {
            const option = MENU.addonGroups.flatMap((group) => group.options).find((candidate) => candidate._id === id);
            return option ? { name: option.name, price: option.price } : null;
          }).filter(Boolean);
          return {
            itemId: item.itemId,
            name: menuItem?.name ?? 'Unknown dish',
            sizeId: item.sizeId,
            sizeName: size?.name || undefined,
            addonIds: item.addonIds ?? [],
            addons,
            note: item.note || undefined,
            price: (size?.price ?? 0) + addons.reduce((sum, addon) => sum + addon.price, 0),
            qty: item.qty,
          };
        });
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const created = {
          _id: 'order-e2e',
          dailyToken: 101,
          branchId: ME.workplace.branch._id,
          status: 'new',
          type: body.type,
          items,
          subtotal,
          discount: body.discount ?? 0,
          taxRate: 0,
          tax: 0,
          deliveryFee: body.deliveryFee ?? 0,
          serviceChargeType: body.serviceChargeType,
          serviceChargeValue: body.serviceChargeValue ?? 0,
          serviceCharge: 0,
          total: subtotal - (body.discount ?? 0) + (body.deliveryFee ?? 0),
          paymentStatus: body.paymentStatus ?? 'unpaid',
          paymentMethod: body.paymentMethod,
          customerId: body.customerId ?? undefined,
          tableId: body.tableId ?? undefined,
          tableName: body.tableName ?? undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        orders.push(created);
        return route.fulfill({ json: created });
      }
      const orderId = path.match(/^\/orders\/([^/]+)$/)?.[1];
      if (method === 'PATCH' && orderId) {
        const index = orders.findIndex((order) => order._id === orderId);
        if (index < 0) return route.fulfill({ status: 404, json: { message: 'Order not found' } });
        orders[index] = { ...orders[index], ...body, updatedAt: new Date().toISOString() };
        return route.fulfill({ json: orders[index] });
      }
      const paymentOrderId = path.match(/^\/orders\/([^/]+)\/payment$/)?.[1];
      if (method === 'POST' && paymentOrderId) {
        const index = orders.findIndex((order) => order._id === paymentOrderId);
        if (index < 0) return route.fulfill({ status: 404, json: { message: 'Order not found' } });
        const rate = ME.workplace.settings.taxByPaymentMethod[body.paymentMethod] ?? 0;
        const taxable = orders[index].subtotal - orders[index].discount + orders[index].deliveryFee + orders[index].serviceCharge;
        const tax = Math.round(taxable * rate) / 100;
        orders[index] = {
          ...orders[index],
          paymentMethod: body.paymentMethod,
          paymentStatus: body.paymentStatus ?? 'paid',
          taxRate: rate,
          tax,
          total: taxable + tax,
          updatedAt: new Date().toISOString(),
        };
        return route.fulfill({ json: orders[index] });
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

test('checkout is bottom-anchored on medium and smaller screens', async ({ app }, testInfo) => {
  const supportedProfiles = [
    'chromium-laptop-mouse',
    'chromium-tablet',
    'webkit-tablet',
    'chromium-phone',
    'chromium-small-phone',
    'webkit-phone',
  ];
  test.skip(!supportedProfiles.includes(testInfo.project.name));

  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  await activate(page, page.getByRole('button', { name: 'View order' }));

  const sheet = page.getByRole('dialog', { name: 'Order' });
  await expect(sheet).toBeVisible();
  const bounds = await sheet.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(Math.abs(bounds.x)).toBeLessThanOrEqual(1);
  expect(bounds.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(Math.abs(bounds.y + bounds.height - viewport.height)).toBeLessThanOrEqual(1);
  expect(bounds.y).toBeGreaterThan(0);
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

  await page.screenshot({ path: testInfo.outputPath('new-order-initial.png'), fullPage: true });

  if (testInfo.project.name.includes('desktop') || testInfo.project.name.includes('laptop') || testInfo.project.name.includes('lg-drawer')) {
    expect(metrics.flexWrap).toBe('wrap');
    expect(metrics.overflowX).toBe('visible');
  } else {
    expect(metrics.flexWrap).toBe('nowrap');
    expect(metrics.overflowX).toBe('auto');
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await rail.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    expect(await rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await page.screenshot({ path: testInfo.outputPath('category-rail-scrolled.png'), fullPage: true });
  }
});

test('small phone checkout keeps fields, quantity buttons and the footer usable', async ({ app }, testInfo) => {
  test.skip(!['chromium-phone', 'chromium-small-phone'].includes(testInfo.project.name));

  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);

  for (const name of ['One less Chicken Karahi', 'One more Chicken Karahi']) {
    const bounds = await checkout.getByRole('button', { name }).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }

  await chooseRadio(page, checkout, 'Delivery');
  const rider = checkout.getByLabel('Rider');
  const deliveryFee = checkout.getByLabel('Delivery fee (Rs)');
  const riderBounds = await rider.boundingBox();
  const feeBounds = await deliveryFee.boundingBox();
  expect(riderBounds).not.toBeNull();
  expect(feeBounds).not.toBeNull();
  expect(feeBounds.y).toBeGreaterThanOrEqual(riderBounds.y + riderBounds.height);
  await deliveryFee.fill('100');

  const content = checkout.locator('#order-details');
  const scrollWidths = await content.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(scrollWidths.scrollWidth).toBeLessThanOrEqual(scrollWidths.clientWidth + 1);

  const placeOrder = checkout.getByRole('button', { name: 'Place order' });
  await expect(placeOrder).toBeInViewport();
  const footer = await placeOrder.boundingBox();
  const viewport = page.viewportSize();
  expect(footer).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(footer.y + footer.height).toBeLessThanOrEqual(viewport.height + 1);
});

test('category filters work across a large real-menu-shaped catalogue', async ({ app }) => {
  const { page } = app;
  await chooseRadio(page, page.getByRole('group', { name: 'Category' }), 'Pizza');
  await expect(page.getByRole('button').filter({ hasText: 'Dish 25' }).first()).toBeVisible();
  await expect(page.getByRole('button').filter({ hasText: 'Chicken Karahi' })).toHaveCount(0);
});

test('categories stay on the menu picker, not in the cart, without overflow', async ({ app }, testInfo) => {
  const { page } = app;
  const dishes = page.getByRole('list', { name: 'Dishes' });
  await expect(dishes.getByRole('listitem').filter({ hasText: 'Chicken Karahi' }).getByText('Karahi', { exact: true })).toBeVisible();
  await expect(dishes.getByRole('listitem').filter({ hasText: 'Biryani' }).getByText('Rice', { exact: true })).toBeVisible();
  await addDish(page, 'Chicken Karahi');
  await addDish(page, 'Biryani');

  const picker = page.getByRole('dialog', { name: 'Biryani' });
  await chooseRadio(page, picker, 'Full · Rs 550');
  await activate(page, picker.getByRole('button', { name: /Raita/ }));
  await activate(page, picker.getByRole('button', { name: 'Add · Rs 600' }));
  await openCheckout(page);

  const cart = page.getByRole('list', { name: 'Items in this order' });
  const chicken = cart.getByRole('listitem').filter({ hasText: 'Chicken Karahi' });
  const biryani = cart.getByRole('listitem').filter({ hasText: 'Biryani' });
  await expect(chicken.getByText('Karahi', { exact: true })).toHaveCount(0);
  await expect(biryani.getByText('Rice', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('order-lines-compact.png'), fullPage: true });

  const dimensions = await cart.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
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
  const biryani = page.getByRole('list', { name: 'Dishes' }).getByText('Biryani', { exact: true });
  await biryani.scrollIntoViewIfNeeded();
  await expect(biryani).toBeVisible();
  // iPad WebKit can still be settling content-visibility:auto after an automatic scroll.
  await page.waitForTimeout(150);
  await activate(page, biryani);
  const dialog = page.getByRole('dialog', { name: 'Biryani' });
  await expect(dialog).toBeVisible();
  await chooseRadio(page, dialog, 'Full · Rs 550');
  await activate(page, dialog.getByRole('button', { name: /Raita/ }));
  await activate(page, dialog.getByRole('button', { name: 'Add · Rs 600' }));
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Rs 600').first()).toBeVisible();
});

test('quantity changes update the order line and checkout total', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const plus = page.getByRole('button', { name: 'One more Chicken Karahi' });
  if (await plus.count()) {
    await activate(page, plus);
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
  const addDiscount = checkout.getByRole('button', { name: 'Add discount' });
  const addCustomer = checkout.getByRole('button', { name: 'Add customer' });
  const discountBounds = await addDiscount.boundingBox();
  const customerBounds = await addCustomer.boundingBox();
  expect(discountBounds).not.toBeNull();
  expect(customerBounds).not.toBeNull();
  expect(customerBounds.x).toBeGreaterThan(discountBounds.x);
  expect(Math.abs(customerBounds.y - discountBounds.y)).toBeLessThan(4);
  await activate(page, addCustomer);

  const customerDialog = page.getByRole('dialog', { name: 'Select customer' });
  await expect(customerDialog).toBeVisible();
  await customerDialog.getByRole('combobox', { name: 'Find customer by phone number or name' }).fill('ali');
  await activate(page, customerDialog.getByRole('option', { name: /Ali Raza/ }));
  const selected = checkout.getByRole('button', { name: 'Remove Ali Raza' });
  await expect(selected).toBeVisible();
  await expect(customerDialog).toHaveCount(0);

  await activate(page, checkout.getByRole('button', { name: 'Add discount' }));
  const discountInput = checkout.getByRole('textbox', { name: 'Discount (Rs)' });
  await discountInput.fill('1500');
  await expect(checkout.getByText('Only Rs 1,000 can be applied; discounts cannot exceed the subtotal.')).toBeVisible();
  const label = checkout.locator('label[for]').filter({ hasText: 'Discount (Rs)' });
  await expect(label).toBeVisible();
  const inputBounds = await discountInput.boundingBox();
  const labelBounds = await label.boundingBox();
  const selectedBounds = await selected.boundingBox();
  const checkoutBounds = await checkout.boundingBox();
  expect(inputBounds).not.toBeNull();
  expect(labelBounds).not.toBeNull();
  expect(selectedBounds).not.toBeNull();
  expect(checkoutBounds).not.toBeNull();
  expect(Math.abs(labelBounds.y - selectedBounds.y)).toBeLessThan(20);
  expect(inputBounds.y).toBeGreaterThan(selectedBounds.y + selectedBounds.height);
  expect(inputBounds.width).toBeGreaterThan(checkoutBounds.width * 0.7);

  await chooseRadio(page, checkout, 'Khata');
  await expect(checkout.getByRole('radio', { name: 'Cash', exact: true })).toBeVisible();
  await expect(checkout.getByText(/Khata needs a saved customer/)).toHaveCount(0);
});

test('saving a new customer in checkout does not place the order', async ({ app }) => {
  const { page, writes } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);

  await activate(page, checkout.getByRole('button', { name: 'Add customer' }));
  const customerDialog = page.getByRole('dialog', { name: 'Select customer' });
  await customerDialog.getByRole('combobox', { name: 'Find customer by phone number or name' }).fill('0321 7654321');
  await activate(page, customerDialog.getByRole('option', { name: /Add “0321-7654321” as a new customer/ }));

  const customerDrawer = page.getByRole('dialog', { name: 'New customer' });
  await customerDrawer.getByLabel('Name').fill('New Customer');
  await activate(page, customerDrawer.getByRole('button', { name: 'Save and pick' }));

  await expect(customerDrawer).toHaveCount(0);
  await expect(checkout.getByRole('button', { name: 'Remove New Customer' })).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/new$/);
  expect(writes.filter((write) => write.method === 'POST' && write.path === '/customers')).toHaveLength(1);
  expect(writes.filter((write) => write.method === 'POST' && write.path === '/orders')).toHaveLength(0);

  await activate(page, checkout.getByRole('button', { name: 'Place order' }));
  await expect(page).toHaveURL(/\/orders$/);
  expect(writes.filter((write) => write.method === 'POST' && write.path === '/orders')).toHaveLength(1);
});

test('orders list exposes the board actions and completes an order from its row menu', async ({ app }) => {
  const { page, writes } = app;
  await createOrderAndShowList(page);

  const row = page.getByRole('listitem').filter({ hasText: '#101' });
  await expect(row).toBeVisible();
  await activate(page, row.getByRole('button', { name: 'More for order 101' }));

  const menu = page.getByRole('menu');
  for (const name of ['Details', 'Print kitchen slip', 'Print receipt', 'Mark as complete', 'Edit order', 'Cancel order']) {
    await expect(menu.getByRole('menuitem', { name })).toBeVisible();
  }

  const viewport = page.viewportSize();
  const menuBounds = await menu.boundingBox();
  const triggerBounds = await row.getByRole('button', { name: 'More for order 101' }).boundingBox();
  if (!viewport || !menuBounds || !triggerBounds) throw new Error('The order actions menu or trigger has no visible bounds');
  expect(triggerBounds.width).toBeGreaterThanOrEqual(40);
  expect(triggerBounds.height).toBeGreaterThanOrEqual(40);
  expect(menuBounds.x).toBeGreaterThanOrEqual(0);
  expect(menuBounds.y).toBeGreaterThanOrEqual(0);
  expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(menuBounds.y + menuBounds.height).toBeLessThanOrEqual(viewport.height + 1);

  await activate(page, menu.getByRole('menuitem', { name: 'Mark as complete' }));
  await expect(row.getByText('Done', { exact: true })).toBeVisible();
  expect(writes.filter((write) => write.method === 'PATCH' && write.path === '/orders/order-e2e')).toHaveLength(1);

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('orders list action menu supports keyboard navigation and restores focus', async ({ app }) => {
  const { page } = app;
  await createOrderAndShowList(page);

  const trigger = page.getByRole('button', { name: 'More for order 101' });
  await trigger.focus();
  await trigger.press('ArrowDown');

  const menu = page.getByRole('menu');
  const details = menu.getByRole('menuitem', { name: 'Details' });
  await expect(details).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Print kitchen slip' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('payment sheet can mark an unpaid list-view order complete in the same flow', async ({ app }) => {
  const { page, writes } = app;
  await createOrderAndShowList(page);

  const row = page.getByRole('listitem').filter({ hasText: '#101' });
  await activate(page, row.getByRole('button', { name: 'More for order 101' }));
  await activate(page, page.getByRole('menuitem', { name: 'Details' }));

  const details = page.getByRole('dialog', { name: 'Order #101' });
  await expect(details).toBeVisible();
  await activate(page, details.getByRole('button', { name: 'Record payment for order 101' }));

  const payment = page.getByRole('dialog', { name: 'Order #101' }).last();
  await expect(payment.getByLabel('Mark order as complete')).toBeVisible();
  const viewport = page.viewportSize();
  const paymentBounds = await payment.boundingBox();
  if (!viewport || !paymentBounds) throw new Error('The payment sheet has no visible bounds');
  expect(paymentBounds.x).toBeGreaterThanOrEqual(0);
  expect(paymentBounds.y).toBeGreaterThanOrEqual(0);
  expect(paymentBounds.x + paymentBounds.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(paymentBounds.y + paymentBounds.height).toBeLessThanOrEqual(viewport.height + 1);
  await payment.getByLabel('Mark order as complete').check();
  await activate(page, payment.getByRole('button', { name: /^Cash/ }));

  await expect(row.getByText('Done', { exact: true })).toBeVisible();
  await expect(row.getByText('Paid', { exact: true })).toBeVisible();
  expect(writes).toContainEqual({
    method: 'POST',
    path: '/orders/order-e2e/payment',
    body: { paymentMethod: 'cash' },
  });
  expect(writes).toContainEqual({
    method: 'PATCH',
    path: '/orders/order-e2e',
    body: { status: 'completed' },
  });
});

test('saved customer delivery address is prefilled and remains editable', async ({ app }) => {
  const { page } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await activate(page, checkout.getByRole('button', { name: 'Add customer' }));

  const customerDialog = page.getByRole('dialog', { name: 'Select customer' });
  await customerDialog.getByRole('combobox', { name: 'Find customer by phone number or name' }).fill('ali');
  await activate(page, customerDialog.getByRole('option', { name: /Ali Raza/ }));
  await chooseRadio(page, checkout, 'Delivery');

  const address = checkout.getByLabel('Complete address');
  await expect(address).toHaveValue(/House 17/);
  await address.fill('Temporary venue, Main Gate');
  await expect(address).toHaveValue('Temporary venue, Main Gate');
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
  await expect(checkout.getByRole('heading', { name: 'Service charge' })).toBeVisible();
  await expect(checkout.getByText('Rs 1,075')).toBeVisible();

  await chooseRadio(page, checkout, 'Paid now');
  await chooseRadio(page, checkout, 'Cash');
  await expect(checkout.getByText('Tax (15%)')).toBeVisible();
  await expect(checkout.getByText('Rs 1,225')).toBeVisible();
});

test('changing order type removes stale table and delivery-only fields from the submitted payload', async ({ app }) => {
  const { page, writes } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);

  await checkout.getByLabel('Table').selectOption('table-8');
  await chooseRadio(page, checkout, 'Delivery');
  await expect(checkout.getByRole('region', { name: 'Service charge' })).toHaveCount(0);
  await expect(checkout.getByLabel('Delivery fee (Rs)')).toBeVisible();
  await checkout.getByLabel('Complete address').fill('House 5, Main Road');
  await checkout.getByLabel('Rider').fill('Ahmed');
  await checkout.getByLabel('Delivery fee (Rs)').fill('150');
  await chooseRadio(page, checkout, 'Takeaway');
  await expect(checkout.getByRole('region', { name: 'Service charge' })).toHaveCount(0);
  await expect(checkout.getByLabel('Delivery fee (Rs)')).toHaveCount(0);

  await activate(page, checkout.getByRole('button', { name: 'Place order' }));
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

test('dine-in defaults to the first active table and can be placed without one', async ({ app }) => {
  const { page, writes } = app;
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  const table = checkout.getByLabel('Table (optional)');
  await expect(table).toHaveValue('table-1');
  await table.selectOption('');
  await activate(page, checkout.getByRole('button', { name: 'Place order' }));
  await expect(page).toHaveURL(/\/orders$/);

  const orderWrite = writes.find((write) => write.method === 'POST' && write.path === '/orders');
  expect(orderWrite).toBeTruthy();
  expect(orderWrite.body).toMatchObject({ type: 'dine_in' });
  expect(orderWrite.body.tableId).toBeUndefined();
  expect(orderWrite.body.tableName).toBeUndefined();
});

test('rapid double activation cannot create duplicate orders', async ({ app }, testInfo) => {
  const { page, writes } = app;
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await chooseRadio(page, checkout, 'Takeaway');
  const place = checkout.getByRole('button', { name: 'Place order' });
  const touch = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  if (touch) {
    await activate(page, place);
    await place.tap({ timeout: 1_000 }).catch(() => {});
  } else {
    await place.dblclick({ timeout: 5_000 }).catch(() => {});
  }
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

test('production order workspace stays within a basic navigation budget', async ({ app }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));
  const { page } = app;
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return {
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd : 0,
      transferredBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
    };
  });
  expect(metrics.domContentLoaded).toBeGreaterThan(0);
  expect(metrics.domContentLoaded).toBeLessThan(8_000);
  expect(metrics.transferredBytes).toBeLessThan(8_000_000);
});

test('menu, checkout and customer picker have no serious WCAG 2.2 A/AA axe violations', async ({ app }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-phone'].includes(testInfo.project.name));
  const { page } = app;

  const assertAccessible = async () => {
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
  };

  await assertAccessible();
  await addDish(page, 'Chicken Karahi');
  const checkout = await openCheckout(page);
  await assertAccessible();

  await activate(page, checkout.getByRole('button', { name: 'Add customer' }));
  await expect(page.getByRole('dialog', { name: 'Select customer' })).toBeVisible();
  await assertAccessible();
});
