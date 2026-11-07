// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAuthStore from '../store/auth_store';
import sampleMe from '../test/sample_me';
import type Order from '../types/order';
import printOnThisPc from './print_on_this_pc';

vi.mock('./offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));

const order = { _id: 'k1-abc', dailyToken: 'A-3', type: 'takeaway', items: [{ itemId: 'm1', name: 'Karahi', qty: 1, price: 1400 }], pendingSync: true } as unknown as Order;
const kitchen = { systemName: 'Kitchen Star', label: 'Kitchen', prints: ['kitchen'], categoryIds: [], width: 32, copies: 1, present: true };

describe('printOnThisPc', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    useAuthStore.getState().setMe(sampleMe());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('an automatic slip is sent with its key, the one the synced order\'s slip from the server has', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ printers: [kitchen] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    expect(await printOnThisPc(order, 'kitchen', 'k1-abc')).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1]![1].body)).toMatchObject({ printer: 'Kitchen Star', kind: 'kitchen', orderKey: 'k1-abc' });
  });

  it('an automatic slip printed before is not printed again', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ printers: [kitchen] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ printed: false, duplicate: true }) });
    expect(await printOnThisPc(order, 'kitchen', 'k1-abc')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('is false without an agent, so the person is offered the browser print', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));
    expect(await printOnThisPc(order, 'kitchen', 'k1-abc')).toBe(false);
  });

  it('routes a kitchen slip independently to multiple present printers', async () => {
    const bar = { ...kitchen, systemName: 'Bar Star', label: 'Bar' };
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ printers: [kitchen, bar] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    expect(await printOnThisPc(order, 'kitchen', 'multi-print-id')).toBe(true);
    const requests = fetchMock.mock.calls.slice(1).map(([, init]) => JSON.parse(init.body));
    expect(requests.map((item) => item.printer)).toEqual(['Kitchen Star', 'Bar Star']);
    expect(requests.map((item) => item.orderKey)).toEqual(['multi-print-id', 'multi-print-id']);
  });

  it('skips printers no longer present in Windows', async () => {
    const missing = { ...kitchen, systemName: 'Removed Printer', present: false };
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ printers: [missing, kitchen] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    expect(await printOnThisPc(order, 'kitchen', 'available-only')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1]![1].body).printer).toBe('Kitchen Star');
  });

  it('is false when no printer here prints kitchen slips', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ printers: [{ ...kitchen, prints: ['receipt'] }] }) });
    expect(await printOnThisPc(order, 'kitchen', 'k1-abc')).toBe(false);
  });
});
