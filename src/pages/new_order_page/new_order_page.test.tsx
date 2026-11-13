// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../config/api';
import { resetBreakpoints } from '../../hooks/useBreakpoint';
import getCache from '../../store/get_cache';
import useAuthStore from '../../store/auth_store';
import useOutboxStore from '../../store/outbox_store';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';
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
    // Wide is a desktop: the order panel docks beside the menu from lg (64rem) up (ui/docked_sheet).
    matches: query.includes('min-width: 48rem') || query.includes('min-width: 64rem') ? wide : false,
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
const pick = (label: RegExp) => fireEvent.click(screen.getByRole('radio', { name: label }));

beforeEach(() => {
  setWidth(true);
  mocked.mockReset();
  mocked.mockImplementation(async (config: { url: string }) => ({ data: answers[config.url] }));
  mocked.post.mockReset();
  mocked.put.mockReset();
  useAuthStore.getState().setMe(sampleMe());
  useOutboxStore.setState({ items: [], savedIds: {}, online: true });
  useOrdersWorkspaceStore.getState().reset();
  getCache.clear?.();
  window.scrollTo = vi.fn() as never;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => cleanup());

describe('New order (desktop)', () => {
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

  it('opens choices before adding a configurable dish', async () => {
    renderPage();
    await screen.findByText('Biryani');
    fireEvent.click(dishTile('Biryani'));
    expect(await screen.findByRole('radio', { name: /Full · Rs 550/ })).toBeTruthy();
    expect(screen.queryByText('1 item')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /Full · Rs 550/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Raita/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Add · Rs 600' }));
    await waitFor(() => expect(screen.getByText('1 item')).toBeTruthy());
    expect(screen.getAllByText('Rs 600').length).toBeGreaterThan(0);
  });

  it('offers compact dish tiles and saves desktop new-order layout locally', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    expect(dishTile('Chicken Karahi').closest('li')?.getAttribute('data-density')).toBe('comfortable');

    fireEvent.click(screen.getByRole('button', { name: 'View options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hide navigation sidebar' }));
    expect(useOrdersWorkspaceStore.getState().sidebarHidden).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'View options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Compact dish tiles' }));
    expect(useOrdersWorkspaceStore.getState().menuDensity).toBe('compact');
    expect(dishTile('Chicken Karahi').closest('li')?.getAttribute('data-density')).toBe('compact');
    expect(JSON.parse(localStorage.getItem('restora-orders-workspace-v1')!)).toMatchObject({
      sidebarHidden: true,
      menuDensity: 'compact',
    });
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
    expect(screen.getByText('Khata needs a customer: pick one at the top.')).toBeTruthy();
  });

  it('finds a customer by name, shows what they owe, and sends them with the order', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv3', dailyToken: 9 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'ali' } });
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
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: '0321 7654321' } });
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
    fireEvent.change(screen.getByLabelText(/Address/), { target: { value: 'House 5, Block C' } });
    fireEvent.change(screen.getByLabelText(/Delivery fee/), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add discount' }));
    fireEvent.change(screen.getByLabelText(/Discount/), { target: { value: '100' } });
    await waitFor(() => expect(screen.getAllByText('Rs 1,050').length).toBeGreaterThan(0));
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({ type: 'delivery', address: 'House 5, Block C', deliveryFee: 150, discount: 100 });
  });

  it('prefills a selected customer delivery address and area but lets staff edit them', async () => {
    mocked.post.mockResolvedValue({ data: { _id: 'srv6', dailyToken: 12 } });
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    const address = screen.getByLabelText(/Address/) as HTMLInputElement;
    await waitFor(() => expect(address.value).toBe('House 17, Street 4'));
    expect((screen.getByLabelText('Area') as HTMLInputElement).value).toBe('Gulberg');
    fireEvent.change(address, { target: { value: 'Different entrance, House 20' } });
    fireEvent.change(screen.getByLabelText('Area'), { target: { value: 'DHA' } });
    placeOrder();
    await screen.findByText('Orders board');
    expect(mocked.post.mock.calls[0]![1]).toMatchObject({
      customerId: 'cu1', type: 'delivery', address: 'Different entrance, House 20', area: 'DHA',
    });
  });

  it('fills the address when the delivery customer is picked afterward', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await waitFor(() => expect((screen.getByLabelText(/Address/) as HTMLInputElement).value).toBe('House 17, Street 4'));
  });

  it('keeps a manually entered delivery address when a customer is picked', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(screen.getByLabelText(/Address/), { target: { value: 'Temporary venue, Main Gate' } });
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await screen.findByText('Ali Raza');
    await waitFor(() => expect((screen.getByLabelText('Area') as HTMLInputElement).value).toBe('Gulberg'));
    expect((screen.getByLabelText(/Address/) as HTMLInputElement).value).toBe('Temporary venue, Main Gate');
  });

  it('replaces an automatically filled address when switching to a different customer', async () => {
    renderPage();
    await screen.findByText('Chicken Karahi');
    fireEvent.click(dishTile('Chicken Karahi'));
    pick(/Delivery/);
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'ali' } });
    fireEvent.click(await screen.findByRole('option', { name: /Ali Raza/ }));
    await waitFor(() => expect((screen.getByLabelText(/Address/) as HTMLInputElement).value).toBe('House 17, Street 4'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ali Raza' }));
    fireEvent.change(screen.getByRole('combobox', { name: /find customer/i }), { target: { value: 'sara' } });
    fireEvent.click(await screen.findByRole('option', { name: /Sara Khan/ }));
    await waitFor(() => expect((screen.getByLabelText(/Address/) as HTMLInputElement).value).toBe('Shop 8, Main Road'));
    expect((screen.getByLabelText('Area') as HTMLInputElement).value).toBe('Model Town');
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
