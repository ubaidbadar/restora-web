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
  status: 'preparing',
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
