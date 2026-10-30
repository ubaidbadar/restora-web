// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import useAuthStore from '../store/auth_store';
import sampleMe from '../test/sample_me';
import type Order from '../types/order';
import printOrder from './print_order';
import printSlip from './print_slip';

vi.mock('../config/api', () => ({ default: { post: vi.fn() } }));
vi.mock('./print_order', () => ({ default: vi.fn() }));
vi.mock('./offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));
const post = vi.mocked(api.post) as unknown as ReturnType<typeof vi.fn>;

const order = { _id: 'A1', dailyToken: 'A-1', type: 'takeaway', items: [{ itemId: 'm1', name: 'Karahi', qty: 1, price: 1400 }] } as unknown as Order;
const kitchen = { systemName: 'Kitchen Star', label: 'Kitchen', prints: ['kitchen'], categoryIds: [], width: 32, copies: 1, present: true };

describe('printSlip', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    post.mockReset();
    vi.mocked(printOrder).mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    useAuthStore.getState().setMe(sampleMe());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('queues the slip at the backend and prints nothing here', async () => {
    post.mockResolvedValue({ data: { queued: 1 } });
    await printSlip(order, 'kitchen');
    expect(post).toHaveBeenCalledWith('/print-jobs', { orderId: 'A1', kind: 'kitchen' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(printOrder).not.toHaveBeenCalled();
  });

  it('without internet, prints through the agent on this PC with the order\'s own id as its key', async () => {
    post.mockRejectedValue(new Error('Network Error'));
    fetchMock.mockResolvedValueOnce({ json: async () => ({ printers: [kitchen] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    await printSlip(order, 'kitchen');
    const [url, init] = fetchMock.mock.calls[1]!;
    expect(url).toBe('http://127.0.0.1:17777/print');
    expect(JSON.parse(init.body)).toMatchObject({ printer: 'Kitchen Star', kind: 'kitchen', orderKey: 'A1', width: 32 });
    expect(printOrder).not.toHaveBeenCalled();
  });

  it('without internet, prints again when asked again, with a key of its own', async () => {
    post.mockRejectedValue(new Error('Network Error'));
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ printers: [kitchen] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ printed: false, duplicate: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    await printSlip(order, 'kitchen');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(JSON.parse(fetchMock.mock.calls[2]![1].body).orderKey).toMatch(/^A1~/);
    expect(printOrder).not.toHaveBeenCalled();
  });

  it('an order not sent yet skips the backend', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ printers: [kitchen] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ printed: true }) });
    await printSlip({ ...order, pendingSync: true }, 'kitchen');
    expect(post).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to the browser when there is no printer set up, or no agent', async () => {
    post.mockRejectedValue(Object.assign(new Error('409'), { response: { status: 409 } }));
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));
    await printSlip(order, 'receipt');
    expect(printOrder).toHaveBeenCalledWith(order, 'receipt');
  });

  it('falls back when the agent has no printer for this kind of slip', async () => {
    post.mockRejectedValue(new Error('Network Error'));
    fetchMock.mockResolvedValue({ json: async () => ({ printers: [kitchen] }) });
    await printSlip(order, 'receipt');
    expect(printOrder).toHaveBeenCalledWith(order, 'receipt');
  });
});
