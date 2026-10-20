// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import getCache from '../store/get_cache';
import useAuthStore from '../store/auth_store';
import useOutboxStore from '../store/outbox_store';
import sampleMe from '../test/sample_me';
import syncOutbox from './sync_outbox';

vi.mock('../config/api', () => ({ default: { request: vi.fn() } }));
vi.mock('./offline_db', () => ({ default: { get: vi.fn(async () => undefined), set: vi.fn(async () => undefined), clear: vi.fn(async () => undefined) } }));
const request = vi.mocked(api.request) as unknown as ReturnType<typeof vi.fn>;

const item = (id: string, url: string, body?: unknown) => ({ id, method: url === '/orders' ? ('post' as const) : ('patch' as const), url, body, label: `Order ${id}`, createdAt: '2026-10-20T10:00:00.000Z' });
const offline = () => Object.assign(new Error('Network Error'), { response: undefined });
const refused = (message: string) => Object.assign(new Error(message), { response: { status: 400, data: { message } } });

describe('syncOutbox', () => {
  beforeEach(() => {
    request.mockReset();
    useAuthStore.getState().setMe(sampleMe());
    useOutboxStore.setState({ items: [], savedIds: {}, online: true });
  });

  it('sends an edit of an order taken offline to the id the server gave it', async () => {
    useOutboxStore.setState({ items: [item('B1', '/orders', { clientId: 'B1' }), { ...item('B1-e', '/orders/B1', { items: [] }), method: 'put' as const }] });
    request.mockResolvedValueOnce({ data: { _id: 'srv2', dailyToken: 3 } }).mockResolvedValueOnce({ data: { _id: 'srv2', dailyToken: 3 } });
    await syncOutbox();
    expect(request.mock.calls[1]![0]).toMatchObject({ method: 'put', url: '/orders/srv2' });
    expect(useOutboxStore.getState().items).toEqual([]);
  });

  it('sends a new order, remembers its server id and sends its status change to that id', async () => {
    useOutboxStore.setState({ items: [item('A1', '/orders', { clientId: 'A1' }), item('A1-s', '/orders/A1', { status: 'preparing' })] });
    request.mockResolvedValueOnce({ data: { _id: 'srv1', dailyToken: 14 } }).mockResolvedValueOnce({ data: { _id: 'srv1', dailyToken: 14, status: 'preparing' } });
    await syncOutbox();
    expect(request.mock.calls[1]![0].url).toBe('/orders/srv1');
    expect(useOutboxStore.getState().items).toEqual([]);
    expect(useOutboxStore.getState().savedIds).toEqual({ A1: 'srv1' });
  });

  it('stops at the first change that cannot reach the server, keeping it and those after it', async () => {
    useOutboxStore.setState({ items: [item('A1', '/orders'), item('A2', '/orders')] });
    request.mockRejectedValueOnce(offline());
    await syncOutbox();
    expect(request).toHaveBeenCalledTimes(1);
    expect(useOutboxStore.getState().items.map((i) => i.id)).toEqual(['A1', 'A2']);
    expect(useOutboxStore.getState().online).toBe(false);
  });

  it('drops a change the server refuses and goes on with the next', async () => {
    useOutboxStore.setState({ items: [item('A1', '/orders'), item('A2', '/orders')] });
    request.mockRejectedValueOnce(refused('One of the dishes is no longer on the menu')).mockResolvedValueOnce({ data: { _id: 'srv2', dailyToken: 3 } });
    await syncOutbox();
    expect(useOutboxStore.getState().items).toEqual([]);
    expect(useOutboxStore.getState().savedIds).toEqual({ A2: 'srv2' });
  });

  it('puts the synced order on the board in place of its offline copy', async () => {
    const key = getCache.keyOf('/orders');
    getCache.set(key, [{ _id: 'A1', dailyToken: 'A-1' }, { _id: 'old', dailyToken: 2 }]);
    useOutboxStore.setState({ items: [item('A1', '/orders')] });
    request.mockResolvedValueOnce({ data: { _id: 'srv1', dailyToken: 15 } });
    await syncOutbox();
    expect(getCache.get(key)).toEqual([{ _id: 'srv1', dailyToken: 15 }, { _id: 'old', dailyToken: 2 }]);
  });
});
