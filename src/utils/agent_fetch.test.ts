// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import agentFetch from './agent_fetch';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('agentFetch', () => {
  it('marks local calls as loopback and gives status checks a finite timeout', async () => {
    const timeout = AbortSignal.abort();
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await agentFetch('/status');

    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:17777/status',
      expect.objectContaining({ targetAddressSpace: 'loopback', signal: timeout }),
    );
  });

  it('allows longer print requests and respects a caller-provided abort signal', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    const signal = AbortSignal.abort();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await agentFetch('/print', { signal });

    expect(timeoutSpy).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ targetAddressSpace: 'loopback', signal });
  });

  it('accepts a per-call timeout override for slower local operations', async () => {
    const timeout = AbortSignal.abort();
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await agentFetch('/status', {}, 4_000);

    expect(timeoutSpy).toHaveBeenCalledWith(4_000);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:17777/status',
      expect.objectContaining({ targetAddressSpace: 'loopback', signal: timeout }),
    );
  });
});
