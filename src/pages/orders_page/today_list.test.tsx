// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../config/api';
import useAuthStore from '../../store/auth_store';
import useOutboxStore from '../../store/outbox_store';
import sampleMe from '../../test/sample_me';
import type Order from '../../types/order';
import TodayList from './today_list';

vi.mock('../../config/api', () => ({ default: Object.assign(vi.fn(), { request: vi.fn(), post: vi.fn() }) }));
vi.mock('../../utils/offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));

const ORDER = {
  _id: 'o1',
  dailyToken: 1,
  status: 'ready',
  type: 'takeaway',
  items: [{ itemId: 'dish-1', name: 'Chicken Karahi', qty: 2, price: 285, addonIds: [] }],
  subtotal: 570,
  discount: 0,
  taxRate: 0,
  tax: 0,
  deliveryFee: 0,
  total: 570,
  paymentStatus: 'unpaid',
  branchId: 'b1',
  createdAt: '2026-11-16T03:00:00.000Z',
} as unknown as Order;

beforeEach(() => {
  vi.mocked(api.request).mockReset();
  vi.mocked(api.post).mockReset();
  useAuthStore.getState().setMe(sampleMe());
  useOutboxStore.setState({ online: true, items: [] });
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => cleanup());

describe('Orders list view', () => {
  it('offers the same available actions as the board menu', () => {
    render(<MemoryRouter><TodayList orders={[ORDER]} onOrderUpdated={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));

    expect(screen.getByRole('menuitem', { name: 'Details' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Print kitchen slip' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Print receipt' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Mark as complete' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Edit order' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Cancel order' })).toBeTruthy();
  });

  it('keeps row actions separate from opening details', () => {
    render(<MemoryRouter><TodayList orders={[ORDER]} onOrderUpdated={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Order #1' })).toBeNull();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Details' }));
    expect(screen.getByRole('dialog', { name: 'Order #1' })).toBeTruthy();
  });

  it('offers Turn down for an unaccepted table order instead of completion or payment', () => {
    const pending = { ...ORDER, status: 'pending' as const };
    render(<MemoryRouter><TodayList orders={[pending]} onOrderUpdated={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));

    expect(screen.getByRole('menuitem', { name: 'Turn down' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Mark as complete' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Cancel order' })).toBeNull();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Turn down' }));
    expect(screen.getByRole('dialog', { name: 'Turn down order #1?' })).toBeTruthy();
  });

  it('submits the cancellation reason when a pending list order is turned down', async () => {
    const pending = { ...ORDER, status: 'pending' as const };
    vi.mocked(api.request).mockResolvedValue({ data: { ...pending, status: 'cancelled' } });
    render(<MemoryRouter><TodayList orders={[pending]} onOrderUpdated={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Turn down' }));
    fireEvent.click(screen.getByLabelText('Other'));
    fireEvent.click(screen.getByRole('button', { name: 'Turn down' }));

    await waitFor(() => expect(api.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'post',
      url: '/orders/o1/cancel',
      data: expect.objectContaining({ reason: 'other' }),
    })));
  });

  it('queues completion from the list menu when the device is offline', () => {
    useOutboxStore.setState({ online: false, items: [] });

    render(<MemoryRouter><TodayList orders={[ORDER]} onOrderUpdated={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Mark as complete' }));

    expect(api.request).not.toHaveBeenCalled();
    expect(useOutboxStore.getState().items).toHaveLength(1);
    expect(useOutboxStore.getState().items[0]).toMatchObject({
      method: 'patch',
      url: '/orders/o1',
      body: { status: 'completed' },
    });
  });

  it('marks the order complete from its list-row menu', async () => {
    const completed = { ...ORDER, status: 'completed' as const };
    const onOrderUpdated = vi.fn();
    vi.mocked(api.request).mockResolvedValue({ data: completed });

    render(<MemoryRouter><TodayList orders={[ORDER]} onOrderUpdated={onOrderUpdated} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Mark as complete' }));

    await waitFor(() => expect(api.request).toHaveBeenCalledWith({
      method: 'patch',
      url: '/orders/o1',
      data: { status: 'completed' },
    }));
    expect(onOrderUpdated).toHaveBeenCalledWith(completed);
  });
});
