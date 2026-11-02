// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useOutboxStore from '../../store/outbox_store';
import type Order from '../../types/order';
import api from '../../config/api';
import OrderTimeline from './index';

vi.mock('../../config/api', () => ({ default: vi.fn() }));

const sampleOrder: Order = {
  _id: 'ord-123',
  dailyToken: 12,
  type: 'takeaway',
  status: 'new',
  paymentStatus: 'unpaid',
  items: [
    { itemId: 'item-1', name: 'Zinger Burger', qty: 2, price: 500 },
    { itemId: 'item-2', name: 'Fries', qty: 1, price: 200 },
  ],
  subtotal: 1200,
  taxRate: 0,
  tax: 0,
  total: 1200,
  takenBy: 'Counter Waiter',
  createdAt: '2026-11-02T10:00:00.000Z',
};

describe('OrderTimeline offline behavior', () => {
  beforeEach(() => {
    vi.mocked(api).mockResolvedValue({ data: [] });
    useOutboxStore.setState({ items: [], savedIds: {}, online: false });
  });

  it('renders offline order creation immediately from outbox', () => {
    useOutboxStore.setState({
      items: [
        {
          id: 'ord-offline-1',
          method: 'post',
          url: '/orders',
          body: { takenBy: 'Ali Waiter', placedAt: '2026-11-02T10:05:00.000Z' },
          label: 'Order 12',
          createdAt: '2026-11-02T10:05:00.000Z',
          preview: sampleOrder,
        },
      ],
    });

    render(<OrderTimeline order={{ ...sampleOrder, _id: 'ord-offline-1', pendingSync: true }} />);

    expect(screen.getByText('Placed')).toBeTruthy();
    expect(screen.getByText('Ali Waiter')).toBeTruthy();
  });

  it('renders offline dish additions and removals from outbox changes without server call', () => {
    const diff = {
      before: { total: 1200 },
      after: {
        total: 1500,
        lines: [
          { name: 'Fries', detail: undefined, was: 1, now: 0 },
          { name: 'Zinger Burger', detail: undefined, was: 2, now: 3 },
          { name: 'Cold Drink', detail: undefined, was: 0, now: 1 },
        ],
      },
    };

    useOutboxStore.setState({
      items: [
        {
          id: 'ord-123-edit-1',
          method: 'put',
          url: '/orders/ord-123',
          body: { editedBy: 'Floor Manager', editedAt: '2026-11-02T10:30:00.000Z' },
          label: 'Changes to order #12',
          createdAt: '2026-11-02T10:30:00.000Z',
          preview: { ...sampleOrder, total: 1500 },
          changes: diff,
        },
      ],
    });

    render(<OrderTimeline order={sampleOrder} />);

    expect(screen.getByText('Changed')).toBeTruthy();
    expect(screen.getByText('Floor Manager')).toBeTruthy();
    // Check that added and removed dishes are rendered
    expect(screen.getByText(/1 × Fries/)).toBeTruthy();
    expect(screen.getByText(/1 × Cold Drink/)).toBeTruthy();
    expect(screen.getByText('2 →')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
