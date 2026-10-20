// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import useBreakpoint, { resetBreakpoints } from './useBreakpoint';

/** A fake window width: media queries match by their rem width, and listeners hear about changes. */
let width = 375;
const listeners = new Set<() => void>();
function setWidth(px: number) {
  width = px;
  listeners.forEach((listener) => listener());
}

beforeEach(() => {
  listeners.clear();
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return width >= Number(/(\d+)rem/.exec(query)![1]) * 16;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  resetBreakpoints();
});

describe('useBreakpoint', () => {
  it('matches Tailwind md, lg and xl', () => {
    width = 375;
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ md: false, lg: false, xl: false });
    width = 800;
    resetBreakpoints();
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ md: true, lg: false, xl: false });
    width = 1300;
    resetBreakpoints();
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ md: true, lg: true, xl: true });
  });

  it('follows the window across a breakpoint, and keeps the same object within one', () => {
    width = 375;
    const { result } = renderHook(() => useBreakpoint());
    const phone = result.current;
    act(() => setWidth(400));
    expect(result.current).toBe(phone);
    act(() => setWidth(1100));
    expect(result.current).toEqual({ md: true, lg: true, xl: false });
  });

  it('shares three listeners however many components use it', () => {
    renderHook(() => [useBreakpoint(), useBreakpoint(), useBreakpoint()]);
    expect(listeners.size).toBe(1);
  });
});
