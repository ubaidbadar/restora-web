// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetBreakpoints } from '../../hooks/useBreakpoint';
import useAuthStore from '../../store/auth_store';
import sampleMe from '../../test/sample_me';
import type Order from '../../types/order';
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

beforeEach(() => useAuthStore.getState().setMe(sampleMe()));
afterEach(() => cleanup());

describe('Orders board', () => {
  it('on phones and tablets renders only the picked status', () => {
    setWide(false);
    render(<MemoryRouter><BoardColumns orders={ORDERS} /></MemoryRouter>);
    expect(tokensShown()).toEqual(['#1', '#2']);
    fireEvent.click(screen.getByRole('button', { name: /Preparing/ }));
    expect(tokensShown()).toEqual(['#3']);
  });

  it('on wide screens renders all five columns, without the status tabs', () => {
    setWide(true);
    render(<MemoryRouter><BoardColumns orders={ORDERS} /></MemoryRouter>);
    expect(tokensShown()).toHaveLength(5);
    expect(screen.queryByRole('group', { name: 'Order status' })).toBeNull();
  });
});
