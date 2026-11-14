// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../config/api';
import { resetBreakpoints } from '../../hooks/useBreakpoint';
import getCache from '../../store/get_cache';
import useAuthStore from '../../store/auth_store';
import useOutboxStore from '../../store/outbox_store';
import sampleMe from '../../test/sample_me';
import type Customer from '../../types/customer';
import type Menu from '../../types/menu';
import type Order from '../../types/order';
import NewOrderPage from '.';

vi.mock('../../config/api', () => {
  const fn = vi.fn() as unknown as Record<string, unknown>;
  fn.get = vi.fn();
  fn.post = vi.fn();
  fn.put = vi.fn();
  fn.request = vi.fn();
  return { default: fn };
});
vi.mock('../../utils/offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));

const mocked = api as unknown as ReturnType<typeof vi.fn> & { post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; request: ReturnType<typeof vi.fn> };

const MENU: Menu = {
  categories: [{ _id: 'c1', name: 'Karahi', sortOrder: 0 }],
  addonGroups: [{ _id: 'g1', name: 'Raita', min: 0, max: 1, options: [{ _id: 'o1', name: 'Raita', price: 50 }] }],
  items: [
    { _id: 'd1', categoryId: 'c1', name: 'Chicken Karahi', sizes: [{ _id: 's1', name: '', price: 1000 }], addonGroupIds: [], includes: [], days: [], from: '', to: '', soldOut: false, hidden: false },
    { _id: 'd2', categoryId: 'c1', name: 'Biryani', sizes: [{ _id: 's2', name: 'Half', price: 300 }, { _id: 's3', name: 'Full', price: 550 }], addonGroupIds: ['g1'], includes: [], days: [], from: '', to: '', soldOut: false, hidden: false },
  ],
};
const CUSTOMERS: Customer[] = [
  { _id: 'cu1', name: 'Ali Raza', phone: '+923001234567', tags: [], khataBalance: 500, orderCount: 3, totalSpent: 3000, createdAt: '2026-01-01' },
  { _id: 'cu2', name: 'Sara Khan', phone: '+923009876543', tags: [], khataBalance: 0, orderCount: 2, totalSpent: 1800, createdAt: '2026-01-02' },
];

/** Answers the GETs the page makes (menu, customers, tables). */
const answers: Record<string, unknown> = {
  '/menu': MENU,
  '/customers': CUSTOMERS,
  '/customers/cu1': { ...CUSTOMERS[0], addresses: ['House 17, Street 4', 'Old address'], area: 'Gulberg' },
  '/customers/cu2': { ...CUSTOMERS[1], addresses: ['Shop 8, Main Road'], area: 'Model Town' },
  '/tables': [],
};

let wide = true;
function setWidth(isWide: boolean) {
  wide = isWide;
  window.matchMedia = ((query: string) => ({
    // Wide is a desktop: the order panel docks beside the menu from xl (80rem) up (ui/docked_sheet).
    matches: query.includes('min-width: 48rem') || query.includes('min-width: 64rem') || query.includes('min-width: 80rem') ? wide : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  resetBreakpoints();
}

function renderPage(element = <NewOrderPage />) {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <Routes>
        <Route path="/orders/new" element={element} />
        <Route path="/orders" element={<p>Orders board</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const dishTile = (name: string) => screen.getByText(name, { selector: 'span' }).closest('button')!;
const placeOrder = () => fireEvent.click(screen.getByRole('button', { name: /place order|save changes/i }));
const customerSearch = () => {
  const add = screen.queryByRole('button', { name: 'Add customer' });
  if (add) fireEvent.click(add);
  return screen.getByRole('combobox', { name: /find customer/i });
};
const pick = (label: RegExp) => fireEvent.click(screen.getByRole('radio', { name: label }));

beforeEach(() => {
  setWidth(true);
  mocked.mockReset();
  mocked.mockImplementation(async (config: { url: string }) => ({ data: answers[config.url] }));
  mocked.post.mockReset();
  mocked.put.mockReset();
  useAuthStore.getState().setMe(sampleMe());
  useOutboxStore.setState({ items: [], savedIds: {}, online: true });
  getCache.clear?.();
  window.scrollTo = vi.fn() as never;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('New order (desktop)', () => {
  it('keeps ordered dishes in their own column and checkout flush on the right', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));

    const order = screen.getByRole('region', { name: 'Order' });
    const checkout = screen.getByRole('complementary', { name: 'Checkout' });
    const lines = within(order).getByRole('list', { name: 'Items in this order' });
    expect(lines.parentElement).toBe(order);
    expect(checkout.parentElement).toBe(order.parentElement);
    expect(checkout.parentElement?.className).toContain('fixed inset-y-0 end-0');
    expect(order.className).toContain('border-e');
    expect(within(checkout).getByRole('heading', { name: 'Checkout' })).toBeTruthy();
    expect(within(checkout).queryByRole('list', { name: 'Items in this order' })).toBeNull();
    expect(within(checkout).getByRole('button', { name: 'Place order' })).toBeTruthy();
  });

  it('centres the empty order hint and uses a text-only Add customer action', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');

    const order = screen.getByRole('region', { name: 'Order' });
    const hint = within(order).getByText('Tap a dish to add it.');
    expect(hint.parentElement?.className).toContain('flex-1');
    expect(hint.parentElement?.className).toContain('items-center');

    const addCustomer = screen.getByRole('button', { name: 'Add customer' });
    expect(addCustomer.className).toContain('text-primary');
    expect(addCustomer.className).not.toContain('border-border-strong');
  });

  it('adds mouse navigation for overflowing categories while keeping the row scrollable', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');

    const categories = screen.getByRole('group', { name: 'Category' });
    const viewport = categories.querySelector('.overflow-x-auto') as HTMLDivElement;
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(viewport, 'scrollWidth', { configurable: true, value: 900 });
    Object.defineProperty(viewport, 'scrollBy', { configurable: true, value: vi.fn() });
    expect(categories.parentElement?.className).toContain('md:-mx-6');

    await waitFor(() => {
      fireEvent(window, new Event('resize'));
      expect(within(categories).queryByRole('button', { name: 'Scroll category right', hidden: true })).toBeTruthy();
    });
    fireEvent.click(within(categories).getByRole('button', { name: 'Scroll category right', hidden: true }));
    expect(viewport.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  it('adds dishes, counts them and totals the order', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    fireEvent.click(dishTile('Chicken Karahi'));
    const cart = screen.getByRole('list', { name: 'Items in this order' });
    expect(within(cart).getByLabelText('2 Chicken Karahi')).toBeTruthy();
    expect(screen.getByText('2 items')).toBeTruthy();
    expect(screen.getAllByText('Rs 2,000').length).toBeGreaterThan(0);
    fireEvent.click(within(cart).getByRole('button', { name: 'One less Chicken Karahi' }));
    fireEvent.click(within(cart).getByRole('button', { name: 'One less Chicken Karahi' }));
    expect(screen.queryByRole('list', { name: 'Items in this order' })).toBeNull();
  });

  it('a dish with sizes adds its first size, and Options picks another size and add-ons', async () => {
    renderPage();
    await screen.findByText('Biryani');
    fireEvent.click(dishTile('Biryani'));
    fireEvent.click(screen.getByRole('button', { name: 'Options for Biryani' }));
    fireEvent.click(await screen.findByRole('radio', { name: /Full · Rs 550/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Raita/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Add · Rs 600' }));
    await waitFor(() => expect(screen.getByText('2 items')).toBeTruthy());
    expect(screen.getAllByText('Rs 900').length).toBeGreaterThan(0);
  });

  it('saves an optional takeaway name for a walk-in', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv-name', dailyToken: 70 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(screen.getByLabelText('Name (optional)'), { target: { value: 'For Ahmed' } });
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'takeaway', newName: 'For Ahmed' });
  });

  it('defaults the takeaway name to the selected customer', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv-customer-name', dailyToken: 71 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    expect((screen.getByLabelText('Name (optional)') as HTMLInputElement).value).toBe('Ali Raza');
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ customerId: 'cu1', newName: 'Ali Raza' });
  });

  it('switches from payment status tabs to individual payment method chips', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    pick(/^Paid now$/);
    expect(screen.getByRole('group', { name: 'Paid by' })).toBeTruthy();
    pick(/^Card$/);
    expect((screen.getByRole('radio', { name: 'Card' }) as HTMLInputElement).checked).toBe(true);
  });

  it('adds and clears a percentage service charge for dine-in, updating the total', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv-charge', dailyToken: 72 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Dine-in/);
    fireEvent.change(await screen.findByLabelText(/Table/), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add service charge' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Percentage (%)' }), { target: { value: '10' } });
    expect(screen.getAllByText('Rs 1,100').length).toBeGreaterThan(0);
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'dine_in', serviceChargeType: 'percentage', serviceChargeValue: 10 });
  });

  it('uses fixed service charge and does not charge delivery for it', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Dine-in/);
    fireEvent.click(screen.getByRole('button', { name: 'Add service charge' }));
    pick(/^Fixed$/);
    fireEvent.change(screen.getByLabelText('Amount (Rs)'), { target: { value: '175' } });
    expect(screen.getAllByText('Rs 1,175').length).toBeGreaterThan(0);
    pick(/Delivery/);
    expect(screen.queryByLabelText('Amount (Rs)')).toBeNull();
    expect(screen.getAllByText('Rs 1,000').length).toBeGreaterThan(0);
  });

  it('places a takeaway order and goes to the board', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv1', dailyToken: 7 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    const [url, body] = mocked.post.mock.calls[0]!;
    expect(url).toBe('/orders');
    expect(body).toMatchObject({ type: 'takeaway', paymentStatus: 'unpaid', items: [{ itemId: 'd1', sizeId: 's1', qty: 1 }] });
    expect(body.paymentMethod).toBeUndefined();
    expect(body.clientId).toBeTruthy();
  });

  it('refuses an empty order, a dine-in order without a table, and Paid without a method', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    placeOrder();
    expect(await screen.findByText('Add at least one dish')).toBeTruthy();

    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Dine-in/);
    placeOrder();
    expect(await screen.findByText('Enter the table')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Table/), { target: { value: '4' } });

    pick(/^Paid now$/);
    placeOrder();
    expect(await screen.findByText('Pick how the customer paid')).toBeTruthy();
    expect(mocked.post).not.toHaveBeenCalled();

    mocked.post.mockResolvedValue({ data: { _id: 'srv2', dailyToken: 8 } });
    pick(/^Cash$/);
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'dine_in', tableName: '4', paymentStatus: 'paid', paymentMethod: 'cash' });
  });

  it('warns at once that khata needs a customer', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    pick(/^Khata/);
    expect(screen.getByText('Khata needs a saved customer: tap Add customer above.')).toBeTruthy();
  });

  it('finds a customer by name, shows what they owe, and sends them with the order', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv3', dailyToken: 9 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    expect(screen.getByText('Owes Rs 500')).toBeTruthy();
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ customerId: 'cu1' });
  });

  it('a number nobody has opens the new customer form with it filled in', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(customerSearch(), { target: { value: '0321 7654321' } });
    fireEvent.click(await screen.findByRole('option', { name: /Add “0321-7654321” as a new customer/ }));
    expect(((await screen.findByLabelText(/Mobile number/)) as HTMLInputElement).value).toBe('0321-7654321');
  });

  it('without internet the order waits in the outbox with a device number', async () => {
    useOutboxStore.setState({ online: false });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post).not.toHaveBeenCalled();
    const [item] = useOutboxStore.getState().items;
    expect(item).toMatchObject({ method: 'post', url: '/orders' });
    expect((item!.preview as Order).total).toBe(1000);
  });

  it('a dropped connection while placing saves it in the outbox instead of failing', async () => {
    mocked.post.mockRejectedValue(Object.assign(new Error('Network Error'), { response: undefined }));
    mocked.request.mockRejectedValue(Object.assign(new Error('Network Error'), { response: undefined }));
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    await screen.findByText('Orders board');
    expect(useOutboxStore.getState().items).toHaveLength(1);
  });

  it('a refused order shows the reason and stays on the page', async () => {
    mocked.post.mockRejectedValue(Object.assign(new Error('x'), { isAxiosError: true, response: { status: 400, data: { message: '"Chicken Karahi" is sold out in this branch' } } }));
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    placeOrder();
    expect(await screen.findByText('"Chicken Karahi" is sold out in this branch')).toBeTruthy();
    expect(screen.queryByText('Orders board')).toBeNull();
  });

  it('delivery needs an address, and its fee and a discount change the total', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv5', dailyToken: 11 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    placeOrder();
    expect(await screen.findByText('Enter the delivery address')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Complete address/i), { target: { value: 'House 5, Block C' } });
    fireEvent.change(screen.getByLabelText(/Delivery fee/), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add discount' }));
    fireEvent.change(screen.getByLabelText(/Discount/), { target: { value: '100' } });
    await waitFor(() => expect(screen.getAllByText('Rs 1,050').length).toBeGreaterThan(0));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'delivery', address: 'House 5, Block C', deliveryFee: 150, discount: 100 });
  });

  it('prefills one complete delivery address and does not ask for a separate area', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv6', dailyToken: 12 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    const address = screen.getByLabelText(/Complete address/) as HTMLInputElement;
    await waitFor(() => expect(address.value).toBe('Gulberg, House 17, Street 4'));
    expect(screen.queryByLabelText('Area')).toBeNull();
    fireEvent.change(address, { target: { value: 'Different entrance, House 20' } });
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({
      customerId: 'cu1', type: 'delivery', address: 'Different entrance, House 20',
    });
    expect(mocked.post.mock.calls[0]![1].area).toBeUndefined();
  });

  it('fills the address when the delivery customer is picked afterward', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await waitFor(() => expect((screen.getByLabelText(/Complete address/) as HTMLInputElement).value).toBe('Gulberg, House 17, Street 4'));
  });

  it('keeps a manually entered delivery address when a customer is picked', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(screen.getByLabelText(/Complete address/i), { target: { value: 'Temporary venue, Main Gate' } });
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await screen.findByText('Ali Raza');
    expect(screen.queryByLabelText('Area')).toBeNull();
    expect((screen.getByLabelText(/Complete address/) as HTMLInputElement).value).toBe('Temporary venue, Main Gate');
  });

  it('replaces an automatically filled address when switching to a different customer', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(customerSearch(), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await waitFor(() => expect((screen.getByLabelText(/Complete address/) as HTMLInputElement).value).toBe('Gulberg, House 17, Street 4'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ali Raza' }));
    fireEvent.change(customerSearch(), { target: { value: 'sara' } });
    fireEvent.click(await screen.findByRole('option', { name: /Sara Khan/ }));
    await waitFor(() => expect((screen.getByLabelText(/Complete address/) as HTMLInputElement).value).toBe('Model Town, Shop 8, Main Road'));
    expect(screen.queryByLabelText('Area')).toBeNull();
  });

  it('an empty discount box folds back to the link', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(screen.getByRole('button', { name: 'Add discount' }));
    fireEvent.blur(screen.getByLabelText(/Discount/));
    expect(screen.getByRole('button', { name: 'Add discount' })).toBeTruthy();
  });

  it('editing without internet queues the change and shows it at once', async () => {
    useOutboxStore.setState({ online: false });
    const order = { _id: 'o6', dailyToken: 6, type: 'takeaway', items: [], discount: 0, deliveryFee: 0, status: 'preparing', paymentStatus: 'unpaid', createdAt: '' } as unknown as Order;
    const items = [{ key: 'd1|s1|', itemId: 'd1', name: 'Chicken Karahi', sizeId: 's1', addonIds: [], price: 1000, qty: 1 }];
    renderPage(<NewOrderPage editing={{ order, items }} />);
    await screen.findByText('Edit order #6');
    fireEvent.click(within(screen.getByRole('list', { name: 'Items in this order' })).getByRole('button', { name: 'One more Chicken Karahi' }));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.put).not.toHaveBeenCalled();
    const [item] = useOutboxStore.getState().items;
    expect(item).toMatchObject({ method: 'put', url: '/orders/o6' });
    expect((item!.preview as Order).total).toBe(2000);
  });

  it('edits an order: starts with its dishes and type, and saves with PUT', async () => {
    mocked.put.mockResolvedValue({ data: { _id: 'o5', dailyToken: 5 } });
    const order = { _id: 'o5', dailyToken: 5, type: 'delivery', address: 'House 1', items: [], discount: 0, deliveryFee: 100, status: 'new', paymentStatus: 'unpaid', createdAt: '' } as unknown as Order;
    const items = [{ key: 'd1|s1|', itemId: 'd1', name: 'Chicken Karahi', sizeId: 's1', addonIds: [], price: 1000, qty: 2 }];
    renderPage(<NewOrderPage editing={{ order, items }} />);
    expect(await screen.findByText('Edit order #5')).toBeTruthy();
    expect((screen.getByRole('radio', { name: /Delivery/ }) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByRole('radio', { name: /Pay later/ })).toBeNull();
    placeOrder();
    await screen.findByText('Orders board');
    const [url, body] = mocked.put.mock.calls[0]!;
    expect(url).toBe('/orders/o5');
    expect(body).toMatchObject({ type: 'delivery', address: 'House 1', items: [{ itemId: 'd1', qty: 2 }] });
    expect(body.paymentStatus).toBeUndefined();
  });
});

describe('New order (phone)', () => {
  beforeEach(() => setWidth(false));

  const sheet = () => screen.getByRole('dialog');

  it('lists dishes with a + that turns into a stepper', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(screen.getByRole('button', { name: 'Add Chicken Karahi' }));
    expect(screen.getByLabelText('1 Chicken Karahi')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'One more Chicken Karahi' }));
    expect(screen.getByLabelText('2 Chicken Karahi')).toBeTruthy();
    expect(screen.getByText('Rs 2,000')).toBeTruthy();
  });

  it('keeps the order type and payment when the sheet is closed and opened again', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(screen.getByRole('button', { name: 'Add Chicken Karahi' }));
    fireEvent.click(screen.getByRole('button', { name: /View order/ }));
    pick(/Delivery/);
    pick(/^Khata/);
    // Close (the backdrop), then open again.
    fireEvent.click(sheet().parentElement!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1000 });
    fireEvent.click(screen.getByRole('button', { name: /View order/ }));
    expect((screen.getByRole('radio', { name: /Delivery/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('radio', { name: /^Khata/ }) as HTMLInputElement).checked).toBe(true);
  });

  it('places the order from inside the sheet', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv4', dailyToken: 10 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(screen.getByRole('button', { name: 'Add Chicken Karahi' }));
    fireEvent.click(screen.getByRole('button', { name: /View order/ }));
    fireEvent.click(within(sheet()).getByRole('button', { name: 'Place order' }));
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'takeaway', items: [{ itemId: 'd1', qty: 1 }] });
  });
});
