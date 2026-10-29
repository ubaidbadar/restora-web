// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetBreakpoints } from '../../hooks/useBreakpoint';
import useAuthStore from '../../store/auth_store';
import sampleMe from '../../test/sample_me';
import type Order from '../../types/order';
import api from '../../config/api';
import BoardColumns from './board_columns';

vi.mock('../../config/api', () => ({ default: Object.assign(vi.fn(), { request: vi.fn(), post: vi.fn() }) }));
vi.mock('../../utils/offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));

const order = (id: string, dailyToken: number, status: Order['status']) =>
  ({ _id: id, dailyToken, status, type: 'takeaway', items: [], subtotal: 0, discount: 0, taxRate: 0, tax: 0, deliveryFee: 0, total: 500, paymentStatus: 'unpaid', branchId: 'b1', createdAt: '2026-10-20T10:00:00.000Z' }) as Order;
const ORDERS = [order('a', 1, 'new'), order('b', 2, 'new'), order('c', 3, 'preparing'), order('d', 4, 'ready'), order('e', 5, 'completed')];

function setWide(wide: boolean) {
  window.matchMedia = ((query: string) => ({ media: query, matches: wide, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  resetBreakpoints();
}
// Each card's token, without its screen-reader prefix ("Token ").
const tokensShown = () => screen.queryAllByText(/#\d+$/).map((element) => element.textContent!.replace('Token ', ''));

beforeEach(() => {
  useAuthStore.getState().setMe(sampleMe());
  // jsdom has no scrolling; the status tabs bring the picked one into view.
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => cleanup());

describe('Orders board', () => {
  it('on phones and tablets renders only the picked status', () => {
    setWide(false);
    render(<MemoryRouter><BoardColumns orders={ORDERS} /></MemoryRouter>);
    expect(tokensShown()).toEqual(['#1', '#2']);
    fireEvent.click(screen.getByRole('radio', { name: /Preparing/ }));
    expect(tokensShown()).toEqual(['#3']);
  });

  it('on wide screens renders all five columns, without the status tabs', () => {
    setWide(true);
    render(<MemoryRouter><BoardColumns orders={ORDERS} /></MemoryRouter>);
    expect(tokensShown()).toHaveLength(5);
    expect(screen.queryByRole('group', { name: 'Order status' })).toBeNull();
  });

  it("puts a guest's order from the table at the top of New, to accept or turn down", () => {
    setWide(false);
    render(<MemoryRouter><BoardColumns orders={[...ORDERS, order('g', 6, 'pending')]} /></MemoryRouter>);
    expect(tokensShown()).toEqual(['#6', '#1', '#2']);
    expect(screen.getByText('From table QR')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Accept order 6' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Turn down order 6' })).toBeTruthy();
  });

  it('keeps cancelled orders in their own tab, with why, who and when', () => {
    setWide(false);
    const cancelled = { ...order('x', 7, 'cancelled'), cancellation: { reason: 'out_of_stock', note: 'No chicken left', byName: 'Sana', at: '2026-10-20T10:30:00.000Z' } } as Order;
    render(<MemoryRouter><BoardColumns orders={[...ORDERS, cancelled]} /></MemoryRouter>);
    expect(tokensShown()).toEqual(['#1', '#2']);
    fireEvent.click(screen.getByRole('radio', { name: /Cancelled/ }));
    expect(tokensShown()).toEqual(['#7']);
    expect(screen.getByText(/Out of stock · No chicken left · Sana, 3:30 pm/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Pay/ })).toBeNull();
  });

  it('asks why before cancelling and sends the reason', async () => {
    setWide(false);
    vi.mocked(api.request).mockResolvedValue({ data: { ...ORDERS[0], status: 'cancelled' } });
    render(<MemoryRouter><BoardColumns orders={ORDERS} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'More for order 1' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cancel order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(await screen.findByText('Pick a reason')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Other'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(await screen.findByText('Say why it was cancelled')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^Note/), { target: { value: 'Guest paid at another counter' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    await waitFor(() => expect(api.request).toHaveBeenCalledWith({ method: 'post', url: '/orders/a/cancel', data: { reason: 'other', note: 'Guest paid at another counter' } }));
  });

  it('allows recording payment for completed orders that are unpaid', async () => {
    setWide(false);
    const onOrderUpdated = vi.fn();
    vi.mocked(api.post).mockResolvedValue({ data: { ...ORDERS[4], paymentStatus: 'paid', paymentMethod: 'cash' } });

    render(<MemoryRouter><BoardColumns orders={ORDERS} onOrderUpdated={onOrderUpdated} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('radio', { name: /Done/ }));
    expect(tokensShown()).toEqual(['#5']);
    expect(screen.getByText('Unpaid')).toBeTruthy();

    const payButton = screen.getByRole('button', { name: 'Record payment for order 5' });
    expect(payButton).toBeTruthy();
    fireEvent.click(payButton);

    expect(await screen.findByText('Cash')).toBeTruthy();
    fireEvent.click(screen.getByText('Cash'));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/orders/e/payment', { paymentMethod: 'cash' }));
    expect(onOrderUpdated).toHaveBeenCalledWith({ ...ORDERS[4], paymentStatus: 'paid', paymentMethod: 'cash' });
  });

  it('does not show pay button for completed orders that are already paid', () => {
    setWide(false);
    const order4 = ORDERS[4]!;
    const paidCompleted: Order = { ...order4, paymentStatus: 'paid' as const, paymentMethod: 'cash' as const };
    render(<MemoryRouter><BoardColumns orders={[...ORDERS.slice(0, 4), paidCompleted]} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('radio', { name: /Done/ }));
    expect(tokensShown()).toEqual(['#5']);
    expect(screen.getByText('Paid')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Record payment for order 5' })).toBeNull();
  });
});
