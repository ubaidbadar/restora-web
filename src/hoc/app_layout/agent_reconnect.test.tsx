// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../config/api';
import AgentReconnect from './agent_reconnect';

vi.mock('../../config/api', () => ({ default: { post: vi.fn() } }));
const post = vi.mocked(api.post) as unknown as ReturnType<typeof vi.fn>;

const allow = (state: PermissionState) =>
  Object.defineProperty(navigator, 'permissions', { configurable: true, value: { query: vi.fn(async () => ({ state })) } });

describe('AgentReconnect', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    post.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('pairs an agent that is not paired, once the browser allows reaching it', async () => {
    allow('granted');
    fetchMock.mockResolvedValueOnce({ json: async () => ({ paired: false }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ paired: true }) });
    post.mockResolvedValue({ data: { _id: 'pa1', pairing: { code: '482913' } } });
    render(<AgentReconnect />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [url, init] = fetchMock.mock.calls[1]!;
    expect(url).toBe('http://127.0.0.1:17777/setup/pair');
    expect(init.targetAddressSpace).toBe('loopback');
    expect(JSON.parse(init.body).code).toBe('482913');
  });

  it('does not silently re-pair a PC that was deliberately disconnected', async () => {
    allow('granted');
    fetchMock.mockResolvedValueOnce({ json: async () => ({ paired: false, reconnectRequired: true }) });
    render(<AgentReconnect />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(post).not.toHaveBeenCalled();
  });

  it('never reaches for the agent before the browser has been allowed to', async () => {
    allow('prompt');
    render(<AgentReconnect />);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('leaves a paired agent alone', async () => {
    allow('granted');
    fetchMock.mockResolvedValueOnce({ json: async () => ({ paired: true }) });
    render(<AgentReconnect />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(post).not.toHaveBeenCalled();
  });
});
