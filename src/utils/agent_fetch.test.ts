// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import agentFetch from './agent_fetch';

describe('agentFetch', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('aborts a localhost request when its deadline expires', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
    }));
    vi.stubGlobal('fetch', fetchMock);

    const request = agentFetch('/status', {}, 1_000);
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(request).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:17777/status',
      expect.objectContaining({ targetAddressSpace: 'loopback' }),
    );
  });
});
