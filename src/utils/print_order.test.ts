// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAuthStore from '../store/auth_store';
import sampleMe from '../test/sample_me';
import type Order from '../types/order';
import printOrder from './print_order';

describe('printOrder', () => {
  let writtenHtml = '';

  beforeEach(() => {
    writtenHtml = '';
    useAuthStore.getState().setMe(sampleMe());

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'iframe') {
        const frame = originalCreateElement('iframe');
        Object.defineProperty(frame, 'contentDocument', {
          value: {
            open: vi.fn(),
            write: (html: string) => {
              writtenHtml = html;
            },
            close: vi.fn(),
            images: [],
            createElement: (tag: string) => originalCreateElement(tag),
            head: { appendChild: vi.fn() },
            documentElement: { scrollHeight: 300 },
          },
          writable: true,
        });
        Object.defineProperty(frame, 'contentWindow', {
          value: {
            print: vi.fn(),
            addEventListener: vi.fn(),
          },
          writable: true,
        });
        return frame;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a normal kitchen slip without accounting table headers', () => {
    const order: Order = {
      _id: '1',
      dailyToken: '15',
      type: 'dine_in',
      tableName: '3',
      createdAt: '2026-11-02T12:00:00.000Z',
      items: [{ itemId: 'm1', name: 'Chicken Karahi', qty: 2, price: 1500 }],
      subtotal: 3000,
      total: 3000,
      discount: 0,
      tax: 0,
      taxRate: 0,
      deliveryFee: 0,
      status: 'confirmed',
      paymentStatus: 'unpaid',
    } as unknown as Order;

    printOrder(order, 'kitchen');

    expect(writtenHtml).toContain('KITCHEN');
    expect(writtenHtml).toContain('#15');
    expect(writtenHtml).toContain('Table 3');
    expect(writtenHtml).toContain('2×');
    expect(writtenHtml).toContain('Chicken Karahi');
    // Kitchen slip should not have receipt accounting headers
    expect(writtenHtml).not.toContain('<th>Rate</th>');
    expect(writtenHtml).not.toContain('<th>Qty</th>');
  });

  it('renders a changed kitchen slip with NEW and CANCEL formatting', () => {
    const order: Order = {
      _id: '1',
      dailyToken: '15 CHANGED',
      type: 'dine_in',
      tableName: '3',
      createdAt: '2026-11-02T12:00:00.000Z',
      items: [
        { itemId: 'm1', name: 'CANCEL Naan', qty: 2, price: 50 },
        { itemId: 'm2', name: 'NEW Roti', qty: 4, price: 30 },
      ],
      subtotal: 120,
      total: 120,
      discount: 0,
      tax: 0,
      taxRate: 0,
      deliveryFee: 0,
      status: 'confirmed',
      paymentStatus: 'unpaid',
    } as unknown as Order;

    printOrder(order, 'kitchen');

    expect(writtenHtml).toContain('#15 CHANGED');
    expect(writtenHtml).toContain('<tr class="cancel"><td class="qty">2×</td><td class="item-name">CANCEL Naan</td></tr>');
    expect(writtenHtml).toContain('<tr class="new"><td class="qty">4×</td><td class="item-name">NEW Roti</td></tr>');
    expect(writtenHtml).toContain('-webkit-print-color-adjust: exact');
  });

  it('renders a cancelled order with CANCELLED banner and CANCEL on all dishes', () => {
    const order: Order = {
      _id: '1',
      dailyToken: '15',
      type: 'takeaway',
      createdAt: '2026-11-02T12:00:00.000Z',
      items: [{ itemId: 'm1', name: 'Biryani', qty: 1, price: 600 }],
      subtotal: 600,
      total: 600,
      discount: 0,
      tax: 0,
      taxRate: 0,
      deliveryFee: 0,
      status: 'cancelled',
      paymentStatus: 'unpaid',
      cancellation: {
        reason: 'customer_left',
        note: 'Customer had an emergency',
        byName: 'Waiter Ali',
        at: '2026-11-02T12:10:00.000Z',
      },
    } as unknown as Order;

    printOrder(order, 'kitchen');

    expect(writtenHtml).toContain('#15 CANCELLED');
    expect(writtenHtml).toContain('✕');
    expect(writtenHtml).toContain('CANCELLED');
    expect(writtenHtml).toContain('<b>By:</b> Waiter Ali');
    expect(writtenHtml).toContain('<b>Reason:</b> Customer left - Customer had an emergency');
    // Items should be automatically prefixed with CANCEL and have cancel class
    expect(writtenHtml).toContain('<tr class="cancel"><td class="qty">1×</td><td class="item-name">CANCEL Biryani</td></tr>');
  });

  it('renders a customer receipt with accounting table and totals', () => {
    const order: Order = {
      _id: '1',
      dailyToken: '15',
      type: 'dine_in',
      tableName: '3',
      createdAt: '2026-11-02T12:00:00.000Z',
      items: [{ itemId: 'm1', name: 'Chicken Karahi', qty: 1, price: 1500 }],
      subtotal: 1500,
      total: 1500,
      discount: 0,
      tax: 0,
      taxRate: 0,
      deliveryFee: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
    } as unknown as Order;

    printOrder(order, 'receipt');

    expect(writtenHtml).toContain('<th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th>');
    expect(writtenHtml).toContain('Subtotal');
    expect(writtenHtml).toContain('Total');
    expect(writtenHtml).toContain('Paid');
  });
});
