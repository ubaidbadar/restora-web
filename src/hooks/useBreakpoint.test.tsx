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
  it('matches Tailwind sm, md, lg, xl and 2xl', () => {
    width = 375;
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ sm: false, md: false, lg: false, xl: false, xxl: false });
    width = 800;
    resetBreakpoints();
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ sm: true, md: true, lg: false, xl: false, xxl: false });
    width = 1300;
    resetBreakpoints();
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({ sm: true, md: true, lg: true, xl: true, xxl: false });
  });

  it('identifies a 1536px workspace', () => {
    width = 1600;
    expect(renderHook(() => useBreakpoint()).result.current.xxl).toBe(true);
  });

  it('follows the window across a breakpoint, and keeps the same object within one', () => {
    width = 375;
    const { result } = renderHook(() => useBreakpoint());
    const phone = result.current;
    act(() => setWidth(400));
    expect(result.current).toBe(phone);
    act(() => setWidth(1100));
    expect(result.current).toEqual({ sm: true, md: true, lg: true, xl: false, xxl: false });
  });

  it('shares one listener however many components use it', () => {
    renderHook(() => [useBreakpoint(), useBreakpoint(), useBreakpoint()]);
    expect(listeners.size).toBe(1);
  });
});
