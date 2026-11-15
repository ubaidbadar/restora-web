// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../config/api';
import getCache from '../../../store/get_cache';
import type PrintAgent from '../../../types/print_agent';
import AgentsCard from './agents_card';

vi.mock('../../../config/api', () => ({ default: Object.assign(vi.fn(), { post: vi.fn(), delete: vi.fn() }) }));
vi.mock('../../../utils/toast', () => ({ default: { error: vi.fn() } }));
vi.mock('./this_pc', () => ({ default: () => null }));
vi.mock('./setup_card', () => ({ default: () => <p>Set up printing</p> }));
vi.mock('./agent_row', () => ({ default: ({ agent }: { agent: PrintAgent }) => (
  <li>{agent.name}{agent.printers.map(printer => <span key={printer.systemName}>{printer.label}</span>)}</li>
) }));

const request = vi.mocked(api) as unknown as ReturnType<typeof vi.fn>;
const inventory = (label: string) => [{
  _id: 'pc1', name: 'Counter PC', branchId: 'branch1', lastSeenAt: new Date().toISOString(),
  printers: [{ systemName: 'Windows Printer', label, present: true }],
}];
async function tick(ms = 1) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
}

describe('live PC printer list', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    request.mockReset();
    getCache.clear();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows inventory updates on the open page without disconnecting or pairing', async () => {
    request.mockResolvedValueOnce({ data: inventory('Old inventory') })
      .mockResolvedValue({ data: inventory('Latest inventory') });
    render(<AgentsCard categories={[]} />);
    await tick();
    expect(screen.getByText('Old inventory')).toBeTruthy();
    await tick(5_000);
    expect(screen.queryByText('Old inventory')).toBeNull();
    expect(screen.getByText('Latest inventory')).toBeTruthy();
    expect(request.mock.calls.every(([options]) => options.method === 'GET' && options.url === '/print-agents')).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('refreshes an empty setup list into the connected PC list on demand', async () => {
    request.mockResolvedValueOnce({ data: [] }).mockResolvedValue({ data: inventory('New printer') });
    render(<AgentsCard categories={[]} />);
    await tick();
    expect(screen.getByText('Set up printing')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh list' }));
    await tick();
    expect(screen.getByText('New printer')).toBeTruthy();
    expect(screen.queryByText('Set up printing')).toBeNull();
  });

  it('pauses background/offline polling and catches up when visible or online again', async () => {
    request.mockResolvedValue({ data: inventory('Printer') });
    render(<AgentsCard categories={[]} />);
    await tick();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    await tick(10_000);
    expect(request).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    fireEvent(document, new Event('visibilitychange'));
    await tick();
    expect(request).toHaveBeenCalledTimes(2);
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    await tick(10_000);
    expect(request).toHaveBeenCalledTimes(2);
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    fireEvent(window, new Event('online'));
    await tick();
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('retains the current list after a failed refresh and recovers on the next poll', async () => {
    request.mockResolvedValueOnce({ data: inventory('Known printer') })
      .mockRejectedValueOnce(new Error('Temporary connection failure'))
      .mockResolvedValue({ data: inventory('Updated printer') });
    render(<AgentsCard categories={[]} />);
    await tick();
    await tick(5_000);
    expect(screen.getByText('Known printer')).toBeTruthy();
    await tick(5_000);
    expect(screen.getByText('Updated printer')).toBeTruthy();
  });

  it('stops polling and removes wake-up listeners when leaving the page', async () => {
    request.mockResolvedValue({ data: inventory('Printer') });
    const page = render(<AgentsCard categories={[]} />);
    await tick();
    page.unmount();
    await tick(10_000);
    fireEvent(window, new Event('focus'));
    fireEvent(window, new Event('online'));
    fireEvent(document, new Event('visibilitychange'));
    await tick();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
