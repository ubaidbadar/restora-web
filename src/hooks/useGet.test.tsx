// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import useAuthStore from '../store/auth_store';
import sampleMe from '../test/sample_me';
import useGet from './useGet';
import getCache from '../store/get_cache';

vi.mock('../config/api', () => ({ default: vi.fn() }));
const request = vi.mocked(api) as unknown as ReturnType<typeof vi.fn>;

/** An answer the test lets go when it wants. */
function later<T>() {
  let resolve!: (data: T) => void;
  const promise = new Promise<{ data: T }>((done) => (resolve = (data) => done({ data })));
  return { promise, resolve };
}

describe('useGet', () => {
  afterEach(cleanup);
  beforeEach(() => {
    request.mockReset();
    getCache.clear();
    useAuthStore.getState().setMe(sampleMe());
  });

  it('loads on mount', async () => {
    request.mockResolvedValue({ data: ['a'] });
    const { result } = renderHook(() => useGet<string[]>('/load'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(['a']));
    expect(result.current.loading).toBe(false);
  });

  it('holds the request while active is true', () => {
    renderHook(() => useGet('/held', { active: true }));
    expect(request).not.toHaveBeenCalled();
  });

  it('get merges params into the ones it had', async () => {
    request.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useGet('/merge', { params: { date: '2026-10-20', status: 'open' } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.get({ params: { date: '2026-10-21' } }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request.mock.calls[1]![0].params).toEqual({ date: '2026-10-21', status: 'open' });
    expect(result.current.options.params).toEqual({ date: '2026-10-21', status: 'open' });
  });

  it('ignores an older answer that arrives late', async () => {
    const slow = later<string>();
    const fast = later<string>();
    request.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);
    const { result } = renderHook(() => useGet<string>('/late', { params: { day: 1 } }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    act(() => result.current.get({ params: { day: 2 } }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await act(async () => fast.resolve('day 2'));
    await act(async () => slow.resolve('day 1'));
    expect(result.current.data).toBe('day 2');
  });

  it('shows the cached answer at once on the next visit, then refreshes it', async () => {
    request.mockResolvedValueOnce({ data: 'first' });
    const first = renderHook(() => useGet<string>('/cached'));
    await waitFor(() => expect(first.result.current.data).toBe('first'));
    first.unmount();

    const fresh = later<string>();
    request.mockReturnValueOnce(fresh.promise);
    const second = renderHook(() => useGet<string>('/cached'));
    expect(second.result.current.data).toBe('first');
    expect(second.result.current.loading).toBe(false);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await act(async () => fresh.resolve('second'));
    expect(second.result.current.data).toBe('second');
  });

  it('two screens asking at once make one request', async () => {
    const shared = later<string>();
    request.mockReturnValue(shared.promise);
    const a = renderHook(() => useGet<string>('/shared'));
    const b = renderHook(() => useGet<string>('/shared'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await act(async () => shared.resolve('shared'));
    await waitFor(() => expect(b.result.current.data).toBe('shared'));
    expect(a.result.current.data).toBe('shared');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('keeps each branch apart in the cache', async () => {
    request.mockResolvedValueOnce({ data: 'main orders' });
    const main = renderHook(() => useGet<string>('/branch-orders'));
    await waitFor(() => expect(main.result.current.data).toBe('main orders'));
    main.unmount();

    useAuthStore.getState().setWorkplace({ branch: { _id: 'b2', name: 'Gulberg' } });
    request.mockReturnValueOnce(new Promise(() => undefined));
    const gulberg = renderHook(() => useGet<string>('/branch-orders'));
    expect(gulberg.result.current.data).toBeUndefined();
    expect(gulberg.result.current.loading).toBe(true);
  });

  it('update changes the cached answer too', async () => {
    request.mockResolvedValueOnce({ data: ['a'] });
    const first = renderHook(() => useGet<string[]>('/updated'));
    await waitFor(() => expect(first.result.current.data).toEqual(['a']));
    act(() => first.result.current.update((list) => [...(list ?? []), 'b']));
    first.unmount();

    request.mockReturnValueOnce(new Promise(() => undefined));
    const second = renderHook(() => useGet<string[]>('/updated'));
    expect(second.result.current.data).toEqual(['a', 'b']);
  });
});

